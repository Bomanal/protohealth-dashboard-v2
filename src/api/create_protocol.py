from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src import models
from database import get_db

router = APIRouter()

class ProtocolNameItem(BaseModel):
    protocol_id: str
    protocol_name: str
    protocol_description: str

class FinalOutcomeItem(BaseModel):
    thread_id: str
    triage_outcome: Optional[str]
    final_condition: Optional[str]

class UniqueNodeItem(BaseModel):
    node_id: str

@router.get("/protocol-names", response_model=List[ProtocolNameItem])
def get_protocol_names(db: Session = Depends(get_db)):
    """
    Get all protocol names from triage_protocols_list table
    """
    results = (
        db.query(
            models.TriageProtocolsList.protocol_id,
            models.TriageProtocolsList.protocol_name,
            models.TriageProtocolsList.protocol_description
        )
        .all()
    )
    
    return [
        ProtocolNameItem(
            protocol_id=result.protocol_id,
            protocol_name=result.protocol_name,
            protocol_description=result.protocol_description
        )
        for result in results
    ]

@router.get("/protocol/{protocol_id}/final-outcomes", response_model=List[FinalOutcomeItem])
def get_protocol_final_outcomes(protocol_id: str, db: Session = Depends(get_db)):
    """
    Get all final outcomes from thread_outcomes table for a specific protocol
    """
    results = (
        db.query(
            models.ProtocolThreads.thread_id,
            models.ThreadOutcomes.triage_outcome,
            models.ThreadOutcomes.final_condition
        )
        .join(
            models.ThreadOutcomes,
            models.ProtocolThreads.thread_id == models.ThreadOutcomes.thread_id
        )
        .filter(models.ProtocolThreads.protocol_id == protocol_id)
        .filter(
            (models.ThreadOutcomes.triage_outcome.isnot(None)) |
            (models.ThreadOutcomes.final_condition.isnot(None))
        )  # Include threads with either triage_outcome or final_condition
        .all()
    )
    
    return [
        FinalOutcomeItem(
            thread_id=result.thread_id,
            triage_outcome=result.triage_outcome,
            final_condition=result.final_condition
        )
        for result in results
    ]

@router.get("/threads/unique-nodes", response_model=List[UniqueNodeItem])
def get_unique_nodes_from_threads(thread_ids: str, db: Session = Depends(get_db)):
    """
    Get all unique node IDs from a list of thread IDs using thread_node_values table
    """
    if not thread_ids:
        return []
    
    thread_id_list = thread_ids.split(',')
    thread_id_list = [tid.strip() for tid in thread_id_list]
    
    query_results = (
        db.query(models.ThreadNodeValues.node_id)
        .filter(models.ThreadNodeValues.thread_id.in_(thread_id_list))
        .distinct()
        .order_by(models.ThreadNodeValues.node_id)
        .all()
    )
    
    return [
        UniqueNodeItem(node_id=result[0])
        for result in query_results
    ]
