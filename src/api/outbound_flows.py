from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import SessionLocal
from database_config.models import OutboundFlows
from pydantic import BaseModel
import uuid
import datetime

router = APIRouter(prefix="/outbound_flows", tags=["Outbound Flows"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OutboundFlowBase(BaseModel):
    name: str
    department: str
    status: str
    description: str | None = None
    patient_count: int | None = 0
    completed_count: int | None = 0
    needs_action_count: int | None = 0
    channel: str | None = None

class OutboundFlowCreate(OutboundFlowBase):
    pass

class OutboundFlowUpdate(OutboundFlowBase):
    pass

class OutboundFlowRead(OutboundFlowBase):
    id: uuid.UUID
    created_date: datetime.date
    created_at: datetime.datetime | None = None
    updated_at: datetime.datetime | None = None
    class Config:
        orm_mode = True

@router.post('/', response_model=OutboundFlowRead)
def create_outbound_flow(flow: OutboundFlowCreate, db: Session = Depends(get_db)):
    db_flow = OutboundFlows(**flow.model_dump())
    db.add(db_flow)
    db.commit()
    db.refresh(db_flow)
    return db_flow

@router.get('/', response_model=list[OutboundFlowRead])
def list_outbound_flows(db: Session = Depends(get_db)):
    return db.query(OutboundFlows).all()

@router.get('/{flow_id}', response_model=OutboundFlowRead)
def get_outbound_flow(flow_id: uuid.UUID, db: Session = Depends(get_db)):
    flow = db.query(OutboundFlows).filter(OutboundFlows.id == flow_id).first()
    if not flow:
        raise HTTPException(status_code=404, detail="OutboundFlow not found")
    return flow

@router.put('/{flow_id}', response_model=OutboundFlowRead)
def update_outbound_flow(flow_id: uuid.UUID, flow: OutboundFlowUpdate, db: Session = Depends(get_db)):
    db_flow = db.query(OutboundFlows).filter(OutboundFlows.id == flow_id).first()
    if not db_flow:
        raise HTTPException(status_code=404, detail="OutboundFlow not found")
    for k, v in flow.model_dump(exclude_unset=True).items():
        setattr(db_flow, k, v)
    db.commit()
    db.refresh(db_flow)
    return db_flow

@router.delete('/{flow_id}')
def delete_outbound_flow(flow_id: uuid.UUID, db: Session = Depends(get_db)):
    db_flow = db.query(OutboundFlows).filter(OutboundFlows.id == flow_id).first()
    if not db_flow:
        raise HTTPException(status_code=404, detail="OutboundFlow not found")
    db.delete(db_flow)
    db.commit()
    return {"ok": True} 