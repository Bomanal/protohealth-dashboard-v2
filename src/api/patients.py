from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from database_config.models import Patients
from pydantic import BaseModel
import uuid
import datetime

router = APIRouter(prefix="/patients", tags=["Patients"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PatientBase(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    birthday: datetime.date | None = None
    gender: str | None = None
    contact_info: str | None = None
    notes: str | None = None
    ehr_notes: dict | None = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientRead(PatientBase):
    id: uuid.UUID
    created_at: datetime.datetime | None = None
    updated_at: datetime.datetime | None = None
    class Config:
        orm_mode = True

@router.post('/', response_model=PatientRead)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = Patients(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get('/', response_model=list[PatientRead])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patients).all()

@router.get('/{patient_id}', response_model=PatientRead)
def get_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    patient = db.query(Patients).filter(Patients.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put('/{patient_id}', response_model=PatientRead)
def update_patient(patient_id: uuid.UUID, patient: PatientUpdate, db: Session = Depends(get_db)):
    db_patient = db.query(Patients).filter(Patients.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for k, v in patient.model_dump(exclude_unset=True).items():
        setattr(db_patient, k, v)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete('/{patient_id}')
def delete_patient(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    db_patient = db.query(Patients).filter(Patients.id == patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(db_patient)
    db.commit()
    return {"ok": True} 