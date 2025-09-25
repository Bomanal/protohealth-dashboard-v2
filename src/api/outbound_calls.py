from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import uuid
from datetime import date, time, datetime, timedelta
from enum import Enum

from src import models
from database import get_db
from pydantic import BaseModel, validator

router = APIRouter(prefix="/api/outbound-calls", tags=["outbound-calls"])

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
    selected_protocol: Optional[str] = None

    @validator('patients')
    def validate_patients(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one patient is required')
        return v

# Helpers
def _parse_iso_datetime_or_400(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        # Support trailing Z by converting to +00:00
        parsed = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid datetime format for custom_datetime')
    return parsed

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
    try:
        return ''.join(ch for ch in value if ch.isdigit())
    except Exception:
        return value

def _serialize_call(call: models.OutboundCalls) -> dict:
    return {
        "call_id": str(call.call_id) if call.call_id else None,
        "patient_id": str(call.patient_id) if call.patient_id else None,
        "call_date": call.call_date.isoformat() if call.call_date else None,
        "call_time": call.call_time.isoformat() if call.call_time else None,
        "event_date": call.event_date.isoformat() if call.event_date else None,
        "call_type": call.call_type,
        "procedure": call.Procedure,
        "doctor_instructions": call.doctor_instructions,
        "nurse_instructions": call.nurse_instructions,
        "reschedule_date": call.reschedule_date.isoformat() if call.reschedule_date else None,
        "reschedule_time": call.reschedule_time.isoformat() if call.reschedule_time else None,
    }

def _extract_error_detail(exc: Exception) -> str:
    try:
        # SQLAlchemy DBAPI errors often have .orig with database message
        orig = getattr(exc, 'orig', None)
        if orig is not None:
            return f"{exc.__class__.__name__}: {orig}"
        return f"{exc.__class__.__name__}: {str(exc)}"
    except Exception:
        return str(exc)

# API Endpoints
@router.post("/batch", response_model=None, status_code=status.HTTP_201_CREATED)
def create_batch_outbound_calls(
    call_data: OutboundCallCreateRequest, 
    db: Session = Depends(get_db)
):
    """
    Create multiple outbound calls for a list of patients.
    Handles patient creation/updates and call scheduling.
    """
    successful_calls = []
    failed_calls = []
    
    try:
        # Normalize custom datetime once
        custom_dt: Optional[datetime] = _parse_iso_datetime_or_400(call_data.custom_datetime)

        for patient_data in call_data.patients:
            try:
                parsed_dob = _parse_date_or_400(patient_data.dob)
                normalized_phone = _digits_only(patient_data.phone_number)
                # Debug context for this patient
                print('[batch] processing patient', {
                    'name': patient_data.name,
                    'phone_number': normalized_phone,
                    'dob': patient_data.dob,
                    'parsed_dob': parsed_dob.isoformat() if parsed_dob else None,
                    'gender': patient_data.gender,
                    'scheduling_option': call_data.scheduling_option,
                    'custom_datetime': custom_dt.isoformat() if custom_dt else None,
                    'selected_protocol': call_data.selected_protocol,
                })
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
                
                # Create outbound call
                # Prefer selected_protocol from batch payload; fall back to per-patient call_type if provided
                procedure_value = call_data.selected_protocol or patient_data.call_type

                call = models.OutboundCalls(
                    call_id=uuid.uuid4(),
                    patient_id=patient.patient_id,
                    Procedure=procedure_value,
                    call_date=date.today() if call_data.scheduling_option == SchedulingOption.NOW else None,
                    call_time=datetime.now().time() if call_data.scheduling_option == SchedulingOption.NOW else None,
                    event_date=custom_dt.date() if custom_dt else None
                )
                
                # Set scheduling based on option
                if call_data.scheduling_option == SchedulingOption.CUSTOM and custom_dt:
                    call.call_date = custom_dt.date()
                    call.call_time = custom_dt.time()
                elif call_data.scheduling_option == SchedulingOption.BEST_TIME:
                    # For now, schedule for tomorrow at 9 AM
                    # In production, this would use more sophisticated logic
                    tomorrow = date.today() + timedelta(days=1)
                    call.call_date = tomorrow
                    call.call_time = time(9, 0)
                
                db.add(call)
                db.flush()  # Get the call_id
                
                successful_calls.append(call)
                
            except Exception as e:
                # Log the error for debugging
                print('[batch] error for patient', patient_data.name, '→', repr(e))
                failed_calls.append({
                    "patient_name": patient_data.name,
                    "phone_number": patient_data.phone_number,
                    "error": str(e)
                })
        
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            # Log and surface DB error for debugging
            print('[batch] commit error →', _extract_error_detail(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=_extract_error_detail(e))

        return {
            "successful_calls": [_serialize_call(c) for c in successful_calls],
            "failed_calls": failed_calls,
            "total_processed": len(call_data.patients),
            "success_count": len(successful_calls),
            "failure_count": len(failed_calls)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print('[batch] unhandled error →', _extract_error_detail(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating batch calls: {_extract_error_detail(e)}"
        )

@router.post("/", response_model=None, status_code=status.HTTP_201_CREATED)
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
        
        # Create call
        call = models.OutboundCalls(
            call_id=uuid.uuid4(),
            patient_id=patient_id,
            Procedure=call_type,
            call_date=call_date or date.today(),
            call_time=call_time or datetime.now().time()
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating call: {str(e)}"
        )

@router.get("/", response_model=None)
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
        query = db.query(models.OutboundCalls).join(models.Patients)
        
        if status_filter:
            query = query.join(models.OutboundCallSummary).filter(
                models.OutboundCallSummary.call_status == status_filter.value
            )
        
        total = query.count()
        calls = query.offset(skip).limit(limit).all()
        
        return {
            "calls": calls,
            "total": total
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving calls: {str(e)}"
        )

@router.get("/{call_id}", response_model=None)
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
        
        return call
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving call: {str(e)}"
        )

@router.put("/{call_id}/status", response_model=None)
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
        
        return call
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating call status: {str(e)}"
        )