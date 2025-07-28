from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Any
import uuid
import datetime

from src import models
from pydantic import BaseModel
from database import get_db

router = APIRouter()

class CaseDetailsItem(BaseModel):
    call_id: uuid.UUID
    phone_number: str
    user_name: Optional[str]
    last_call: Optional[datetime.datetime]
    status: Optional[str]
    preliminary_diagnosis: Optional[str]
    triage_outcome: Optional[str]
    call_log: Optional[Any]
    summary: Optional[str]
    medical_history: Optional[str]
    issue: Optional[str]

    class Config:
        orm_mode = True

@router.get("/case-details", response_model=List[CaseDetailsItem])
def get_case_details(db: Session = Depends(get_db)):
    results = (
        db.query(
            models.Conversations.session_id.label("call_id"),
            models.Conversations.user_id.label("phone_number"),
            models.Conversations.user_name.label("user_name"),
            models.Conversations.call_end_time.label("last_call"),
            models.Conversations.conversation_status.label("status"),
            models.TriageOutcomes.final_condition.label("preliminary_diagnosis"),
            models.TriageOutcomes.triage_outcome.label("triage_outcome"),
            models.ConversationTranscripts.conversation_transcript.label("call_log"),
            models.ConversationTranscripts.conversation_summary.label("summary"),
            models.InitialAssessments.medical_history.label("medical_history"),
            models.InitialAssessments.current_complaint.label("issue"),
        )
        .outerjoin(models.TriageOutcomes, models.Conversations.session_id == models.TriageOutcomes.session_id)
        .outerjoin(models.ConversationTranscripts, models.Conversations.session_id == models.ConversationTranscripts.session_id)
        .outerjoin(models.InitialAssessments, models.Conversations.session_id == models.InitialAssessments.session_id)
        .all()
    )
    return results 

@router.get("/case-details/{session_id}", response_model=CaseDetailsItem)
def get_case_details_by_id(session_id: uuid.UUID, db: Session = Depends(get_db)):
    result = (
        db.query(
            models.Conversations.session_id.label("call_id"),
            models.Conversations.user_id.label("phone_number"),
            models.Conversations.user_name.label("user_name"),
            models.Conversations.call_end_time.label("last_call"),
            models.Conversations.conversation_status.label("status"),
            models.TriageOutcomes.final_condition.label("preliminary_diagnosis"),
            models.TriageOutcomes.triage_outcome.label("triage_outcome"),
            models.ConversationTranscripts.conversation_transcript.label("call_log"),
            models.ConversationTranscripts.conversation_summary.label("summary"),
            models.InitialAssessments.medical_history.label("medical_history"),
            models.InitialAssessments.current_complaint.label("issue"),
        )
        .outerjoin(models.TriageOutcomes, models.Conversations.session_id == models.TriageOutcomes.session_id)
        .outerjoin(models.ConversationTranscripts, models.Conversations.session_id == models.ConversationTranscripts.session_id)
        .outerjoin(models.InitialAssessments, models.Conversations.session_id == models.InitialAssessments.session_id)
        .filter(models.Conversations.session_id == session_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Case not found")
    return result 
