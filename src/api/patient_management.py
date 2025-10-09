from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import uuid
from datetime import date
import re

from src import models
from database import get_db
from pydantic import BaseModel, validator

router = APIRouter(prefix="/api/patients", tags=["patients"])

# Pydantic models for request/response
class PatientCreateRequest(BaseModel):
    name: str
    phone_number: str
    dob: date
    gender: str
    medical_history: Optional[str] = None
    patient_context: Optional[str] = None

    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()

    @validator('phone_number')
    def validate_phone_number(cls, v):
        # Remove all non-digit characters for validation
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) < 10:
            raise ValueError('Phone number must contain at least 10 digits')
        return v

    @validator('gender')
    def validate_gender(cls, v):
        allowed_genders = ['Male', 'Female', 'Other']
        if v not in allowed_genders:
            raise ValueError(f'Gender must be one of: {", ".join(allowed_genders)}')
        return v

    @validator('dob')
    def validate_dob(cls, v):
        if v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v

class PatientUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    patient_context: Optional[str] = None

    @validator('name')
    def validate_name(cls, v):
        if v is not None and (not v or len(v.strip()) < 2):
            raise ValueError('Name must be at least 2 characters long')
        return v.strip() if v else v

    @validator('phone_number')
    def validate_phone_number(cls, v):
        if v is not None:
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10:
                raise ValueError('Phone number must contain at least 10 digits')
        return v

    @validator('gender')
    def validate_gender(cls, v):
        if v is not None:
            allowed_genders = ['Male', 'Female', 'Other']
            if v not in allowed_genders:
                raise ValueError(f'Gender must be one of: {", ".join(allowed_genders)}')
        return v

    @validator('dob')
    def validate_dob(cls, v):
        if v is not None and v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v

class PatientResponse(BaseModel):
    patient_id: uuid.UUID
    name: str
    phone_number: str
    dob: date
    gender: str
    medical_history: Optional[str]
    patient_context: Optional[str]

    class Config:
        orm_mode = True

class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int

# API Endpoints
@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_data: PatientCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new patient. Checks for existing patients by phone number first.
    """
    try:
        # Check if patient already exists by phone number
        existing_patient = db.query(models.Patients).filter(
            models.Patients.phone_number == patient_data.phone_number
        ).first()
        
        if existing_patient:
            # Update existing patient with new data
            for field, value in patient_data.dict(exclude_unset=True).items():
                setattr(existing_patient, field, value)
            
            db.commit()
            db.refresh(existing_patient)
            return existing_patient
        
        # Create new patient
        db_patient = models.Patients(**patient_data.dict())
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)
        
        return db_patient
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation. Please check your data."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating patient: {str(e)}"
        )

@router.get("/", response_model=PatientListResponse)
def get_patients(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of patients with optional search and pagination.
    """
    try:
        query = db.query(models.Patients)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (models.Patients.name.ilike(search_term)) |
                (models.Patients.phone_number.ilike(search_term))
            )
        
        total = query.count()
        patients = query.offset(skip).limit(limit).all()
        
        return PatientListResponse(patients=patients, total=total)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patients: {str(e)}"
        )

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get a specific patient by ID.
    """
    try:
        patient = db.query(models.Patients).filter(models.Patients.patient_id == patient_id).first()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        return patient
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving patient: {str(e)}"
        )

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: uuid.UUID, 
    patient_data: PatientUpdateRequest, 
    db: Session = Depends(get_db)
):
    """
    Update an existing patient.
    """
    try:
        patient = db.query(models.Patients).filter(models.Patients.patient_id == patient_id).first()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Update only provided fields
        update_data = patient_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(patient, field, value)
        
        db.commit()
        db.refresh(patient)
        
        return patient
        
    except HTTPException:
        raise
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation. Please check your data."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating patient: {str(e)}"
        )

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Delete a patient (soft delete by setting fields to None).
    """
    try:
        patient = db.query(models.Patients).filter(models.Patients.patient_id == patient_id).first()
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Soft delete - clear sensitive data but keep record
        patient.name = None
        patient.phone_number = None
        patient.dob = None
        patient.gender = None
        patient.medical_history = None
        patient.patient_context = None
        
        db.commit()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting patient: {str(e)}"
        )

@router.get("/search/by-phone/{phone_number}", response_model=Optional[PatientResponse])
def find_patient_by_phone(phone_number: str, db: Session = Depends(get_db)):
    """
    Find a patient by phone number.
    """
    try:
        patient = db.query(models.Patients).filter(models.Patients.phone_number == phone_number).first()
        return patient
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching for patient: {str(e)}"
        )
