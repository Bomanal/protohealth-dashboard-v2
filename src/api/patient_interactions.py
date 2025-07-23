from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from database_config.models import PatientInteractions
from pydantic import BaseModel
import uuid
import datetime

router = APIRouter(prefix="/patient_interactions", tags=["Patient Interactions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PatientInteractionBase(BaseModel):
    patient_id: uuid.UUID
    status: str
    source: str
    timestamp: datetime.datetime
    outbound_flow_id: uuid.UUID | None = None
    source_detail: str | None = None
    last_contact: datetime.datetime | None = None
    notes: str | None = None
    priority: str | None = None
    department: str | None = None
    channel: str | None = None
    conversation_history: dict | None = None

class PatientInteractionCreate(PatientInteractionBase):
    pass

class PatientInteractionUpdate(PatientInteractionBase):
    pass

class PatientInteractionRead(PatientInteractionBase):
    id: uuid.UUID
    created_at: datetime.datetime | None = None
    updated_at: datetime.datetime | None = None
    class Config:
        orm_mode = True

@router.post('/', response_model=PatientInteractionRead)
def create_patient_interaction(interaction: PatientInteractionCreate, db: Session = Depends(get_db)):
    db_interaction = PatientInteractions(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.get('/', response_model=list[PatientInteractionRead])
def list_patient_interactions(db: Session = Depends(get_db)):
    return db.query(PatientInteractions).all()

@router.get('/{interaction_id}', response_model=PatientInteractionRead)
def get_patient_interaction(interaction_id: uuid.UUID, db: Session = Depends(get_db)):
    interaction = db.query(PatientInteractions).filter(PatientInteractions.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="PatientInteraction not found")
    return interaction

@router.put('/{interaction_id}', response_model=PatientInteractionRead)
def update_patient_interaction(interaction_id: uuid.UUID, interaction: PatientInteractionUpdate, db: Session = Depends(get_db)):
    db_interaction = db.query(PatientInteractions).filter(PatientInteractions.id == interaction_id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="PatientInteraction not found")
    for k, v in interaction.model_dump(exclude_unset=True).items():
        setattr(db_interaction, k, v)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.delete('/{interaction_id}')
def delete_patient_interaction(interaction_id: uuid.UUID, db: Session = Depends(get_db)):
    db_interaction = db.query(PatientInteractions).filter(PatientInteractions.id == interaction_id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="PatientInteraction not found")
    db.delete(db_interaction)
    db.commit()
    return {"ok": True} 