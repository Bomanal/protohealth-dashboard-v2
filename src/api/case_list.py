from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import datetime

from src import models
from pydantic import BaseModel
from database import get_db  # Assumes you have a get_db dependency for session

router = APIRouter()

class CaseListItem(BaseModel):
    call_number: uuid.UUID
    phone_number: str
    last_call: Optional[datetime.datetime]
    status: Optional[str]
    preliminary_diagnosis: Optional[str]
    triage_outcome: Optional[str]

    class Config:
        orm_mode = True

@router.get("/case-list", response_model=List[CaseListItem])
def get_case_list(db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Conversations.session_id.label("call_number"),
            models.Conversations.user_id.label("phone_number"),
            models.Conversations.call_end_time.label("last_call"),
            models.Conversations.conversation_status.label("status"),
            models.TriageOutcomes.final_condition.label("preliminary_diagnosis"),
            models.TriageOutcomes.triage_outcome.label("triage_outcome"),
        )
        .outerjoin(models.TriageOutcomes, models.Conversations.session_id == models.TriageOutcomes.session_id)
        .all()
    )
    return results 