from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import logging
import uuid
from datetime import date, time, datetime, timedelta, timezone
from enum import Enum

from src import models
from database import get_db
from src.api.error_logging import log_error
from pydantic import BaseModel, validator

router = APIRouter(prefix="/api/outbound-calls", tags=["outbound-calls"])
logger = logging.getLogger(__name__)

# Enums
class SchedulingOption(str, Enum):
    NOW = "now"
    BEST_TIME = "best_time"
    CUSTOM = "custom"

class CallStatus(str, Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Pydantic models
class PatientData(BaseModel):
    name: str
    phone_number: str
    dob: Optional[str] = None  # Accept string; parse manually
    gender: str
    call_type: Optional[str] = None
    medical_history: Optional[str] = None
    patient_context: Optional[str] = None

class OutboundCallCreateRequest(BaseModel):
    patients: List[PatientData]
    scheduling_option: SchedulingOption
    custom_datetime: Optional[str] = None
    # Deprecated: the dashboard no longer sends this (per-patient call_type is used instead).
    # Still accepted for backward compatibility; when set it overrides call_type for every patient.
    selected_protocol: Optional[str] = None

    @validator('patients')
    def validate_patients(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one patient is required')
        return v

class OutboundCallResponse(BaseModel):
    call_id: Optional[uuid.UUID] = None
    patient_id: Optional[uuid.UUID] = None
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    # call_date/call_time are stored in UTC (columns are tz-naive DATE/TIME)
    call_date: Optional[date] = None
    call_time: Optional[time] = None
    event_date: Optional[date] = None
    call_type: Optional[str] = None
    procedure: Optional[str] = None
    doctor_instructions: Optional[str] = None
    nurse_instructions: Optional[str] = None
    reschedule_date: Optional[date] = None
    reschedule_time: Optional[time] = None
    call_status: Optional[str] = None

class OutboundCallListResponse(BaseModel):
    calls: List[OutboundCallResponse]
    total: int

class FailedCall(BaseModel):
    index: int
    patient_name: Optional[str] = None
    phone_number: Optional[str] = None
    error: str

class BatchOutboundCallResponse(BaseModel):
    successful_calls: List[OutboundCallResponse]
    failed_calls: List[FailedCall]
    total_processed: int
    success_count: int
    failure_count: int

# Helpers
def _parse_iso_datetime_or_400(dt_str: Optional[str]) -> Optional[datetime]:
    """Parse an ISO-8601 datetime and normalise it to timezone-aware UTC.

    Naive values (no offset) are interpreted as UTC; the dashboard always sends
    `Date.toISOString()` which carries a trailing Z.
    """
    if not dt_str:
        return None
    try:
        # Support trailing Z by converting to +00:00
        parsed = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid datetime format for custom_datetime')
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)

def _parse_date_or_400(date_str: Optional[str]) -> Optional[date]:
    if not date_str:
        return None
    # Expect YYYY-MM-DD
    try:
        return date.fromisoformat(date_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid date format for dob; expected YYYY-MM-DD')

def _digits_only(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return ''.join(ch for ch in value if ch.isdigit())

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _serialize_call(call: models.OutboundCalls) -> OutboundCallResponse:
    # Include patient fields via relationship
    patient = getattr(call, 'patient', None)
    summary = getattr(call, 'call_summary', None)

    return OutboundCallResponse(
        call_id=call.call_id,
        patient_id=call.patient_id,
        patient_name=getattr(patient, 'name', None) if patient else None,
        patient_phone=getattr(patient, 'phone_number', None) if patient else None,
        call_date=call.call_date,
        call_time=call.call_time,
        event_date=call.event_date,
        call_type=call.call_type,
        procedure=call.Procedure,
        doctor_instructions=call.doctor_instructions,
        nurse_instructions=call.nurse_instructions,
        reschedule_date=call.reschedule_date,
        reschedule_time=call.reschedule_time,
        call_status=getattr(summary, 'call_status', None) if summary else None,
    )

# API Endpoints
@router.post("/batch", response_model=BatchOutboundCallResponse, status_code=status.HTTP_201_CREATED)
def create_batch_outbound_calls(
    call_data: OutboundCallCreateRequest, 
    db: Session = Depends(get_db)
):
    """
    Create multiple outbound calls for a list of patients.
    Handles patient creation/updates and call scheduling.

    Each patient is processed inside its own SAVEPOINT so a failure for one
    patient does not abort the surrounding transaction for the others.
    """
    successful_calls: List[models.OutboundCalls] = []
    failed_calls: List[FailedCall] = []

    # Normalize custom datetime once (timezone-aware UTC)
    custom_dt: Optional[datetime] = _parse_iso_datetime_or_400(call_data.custom_datetime)

    try:
        for index, patient_data in enumerate(call_data.patients):
            try:
                parsed_dob = _parse_date_or_400(patient_data.dob)
                normalized_phone = _digits_only(patient_data.phone_number)

                with db.begin_nested():
                    # Find or create patient
                    patient = db.query(models.Patients).filter(
                        models.Patients.phone_number == normalized_phone
                    ).first()

                    if not patient:
                        # Create new patient (map fields explicitly)
                        patient = models.Patients(
                            patient_id=uuid.uuid4(),
                            name=patient_data.name,
                            phone_number=normalized_phone,
                            dob=parsed_dob,
                            gender=patient_data.gender,
                            medical_history=patient_data.medical_history,
                            patient_context=patient_data.patient_context,
                        )
                        db.add(patient)
                        db.flush()  # Get the patient_id without committing
                    else:
                        # Update existing patient
                        patient.name = patient_data.name or patient.name
                        patient.phone_number = normalized_phone or patient.phone_number
                        patient.dob = parsed_dob if parsed_dob is not None else patient.dob
                        patient.gender = patient_data.gender or patient.gender
                        if patient_data.medical_history is not None:
                            patient.medical_history = patient_data.medical_history
                        if patient_data.patient_context is not None:
                            patient.patient_context = patient_data.patient_context

                    # Prefer (deprecated) selected_protocol from batch payload; else per-patient call_type
                    procedure_value = call_data.selected_protocol or patient_data.call_type

                    call = models.OutboundCalls(
                        call_id=uuid.uuid4(),
                        patient_id=patient.patient_id,
                        Procedure=procedure_value,
                        event_date=custom_dt.date() if custom_dt else None,
                    )

                    # Set scheduling based on option. All dates/times are UTC.
                    if call_data.scheduling_option == SchedulingOption.NOW:
                        now_utc = _utc_now()
                        call.call_date = now_utc.date()
                        call.call_time = now_utc.time().replace(tzinfo=None)
                    elif call_data.scheduling_option == SchedulingOption.CUSTOM and custom_dt:
                        call.call_date = custom_dt.date()
                        call.call_time = custom_dt.time().replace(tzinfo=None)
                    elif call_data.scheduling_option == SchedulingOption.BEST_TIME:
                        # Placeholder: schedule for tomorrow at 09:00 UTC.
                        # In production, this would use more sophisticated logic.
                        call.call_date = _utc_now().date() + timedelta(days=1)
                        call.call_time = time(9, 0)

                    db.add(call)
                    db.flush()  # Surface DB errors inside this savepoint

                successful_calls.append(call)

            except HTTPException as e:
                # Validation error for this patient (safe, generic message)
                failed_calls.append(FailedCall(
                    index=index,
                    patient_name=patient_data.name,
                    phone_number=patient_data.phone_number,
                    error=str(e.detail),
                ))
            except Exception as e:
                log_error(logger, f"[batch] failed to create call for patient index {index}", e)
                failed_calls.append(FailedCall(
                    index=index,
                    patient_name=patient_data.name,
                    phone_number=patient_data.phone_number,
                    error="Could not create call for this patient",
                ))

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            log_error(logger, "[batch] commit failed", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error saving outbound calls",
            )

        return BatchOutboundCallResponse(
            successful_calls=[_serialize_call(c) for c in successful_calls],
            failed_calls=failed_calls,
            total_processed=len(call_data.patients),
            success_count=len(successful_calls),
            failure_count=len(failed_calls),
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log_error(logger, "[batch] unhandled error", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating batch calls",
        )

@router.post("/", response_model=OutboundCallResponse, status_code=status.HTTP_201_CREATED)
def create_outbound_call(
    patient_id: uuid.UUID,
    call_type: Optional[str] = None,
    call_date: Optional[date] = None,
    call_time: Optional[time] = None,
    db: Session = Depends(get_db)
):
    """
    Create a single outbound call for an existing patient.
    """
    try:
        # Verify patient exists
        patient = db.query(models.Patients).filter(models.Patients.patient_id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Create call (defaults are UTC)
        now_utc = _utc_now()
        call = models.OutboundCalls(
            call_id=uuid.uuid4(),
            patient_id=patient_id,
            Procedure=call_type,
            call_date=call_date or now_utc.date(),
            call_time=call_time or now_utc.time().replace(tzinfo=None)
        )
        
        db.add(call)
        db.flush()
        
        db.commit()
        db.refresh(call)
        
        return _serialize_call(call)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log_error(logger, "create_outbound_call failed", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating call"
        )

@router.get("/", response_model=OutboundCallListResponse)
def get_outbound_calls(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[CallStatus] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of outbound calls with optional filtering and pagination.
    """
    try:
        query = (
            db.query(models.OutboundCalls)
            .join(models.Patients)
            .options(joinedload(models.OutboundCalls.patient), joinedload(models.OutboundCalls.call_summary))
        )
        
        if status_filter:
            query = query.join(models.OutboundCallSummary).filter(
                models.OutboundCallSummary.call_status == status_filter.value
            )
        
        total = query.count()
        calls = query.offset(skip).limit(limit).all()
        
        return OutboundCallListResponse(
            calls=[_serialize_call(c) for c in calls],
            total=total,
        )
        
    except Exception as e:
        log_error(logger, "get_outbound_calls failed", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving calls"
        )

@router.get("/{call_id}", response_model=OutboundCallResponse)
def get_outbound_call(call_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a specific outbound call by ID.
    """
    try:
        call = db.query(models.OutboundCalls).filter(models.OutboundCalls.call_id == call_id).first()
        
        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call not found"
            )
        
        return _serialize_call(call)
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(logger, "get_outbound_call failed", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving call"
        )

@router.put("/{call_id}/status", response_model=OutboundCallResponse)
def update_call_status(
    call_id: uuid.UUID,
    new_status: CallStatus,
    summary: Optional[str] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update the status of an outbound call.
    """
    try:
        call = db.query(models.OutboundCalls).filter(models.OutboundCalls.call_id == call_id).first()
        
        if not call:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Call not found"
            )
        
        # Update or create call summary
        call_summary = db.query(models.OutboundCallSummary).filter(
            models.OutboundCallSummary.call_id == call_id
        ).first()
        
        if not call_summary:
            call_summary = models.OutboundCallSummary(call_id=call_id)
            db.add(call_summary)
        
        call_summary.call_status = new_status.value
        if summary:
            call_summary.call_summary = summary
        if notes:
            call_summary.call_notes = notes
        
        db.commit()
        db.refresh(call)
        
        return _serialize_call(call)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log_error(logger, "update_call_status failed", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating call status"
        )