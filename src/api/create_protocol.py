from fastapi import APIRouter, Depends
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

    class Config:
        orm_mode = True

class FinalOutcomeItem(BaseModel):
    thread_id: str
    final_outcome: str

    class Config:
        orm_mode = True

class ThreadStepDetail(BaseModel):
    step_number: int
    node_id: Optional[str]
    node_name: Optional[str]
    node_category: Optional[str]
    question: Optional[str]
    value: Optional[str]
    node_value_pair_description: Optional[str]

class ThreadDetail(BaseModel):
    thread_id: str
    protocol_id: str
    final_outcome: Optional[str]
    steps: List[ThreadStepDetail]

@router.get("/protocol-names", response_model=List[ProtocolNameItem])
def get_protocol_names(db: Session = Depends(get_db)):
    results = (
        db.query(
            models.TriageProtocolsList.protocol_id,
            models.TriageProtocolsList.protocol_name,
            models.TriageProtocolsList.protocol_description
        )
        .all()
    )
    
    # Convert tuples to ProtocolNameItem objects
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
    Get all final outcomes from decision threads for a specific protocol
    """
    results = (
        db.query(
            models.DecisionThreads.thread_id,
            models.DecisionThreads.final_outcome
        )
        .filter(models.DecisionThreads.protocol_id == protocol_id)
        .filter(models.DecisionThreads.final_outcome.isnot(None))  # Only include threads with final outcomes
        .all()
    )
    
    # Convert tuples to FinalOutcomeItem objects
    return [
        FinalOutcomeItem(
            thread_id=result.thread_id,
            final_outcome=result.final_outcome
        )
        for result in results
    ]

@router.get("/threads/details", response_model=List[ThreadDetail])
def get_threads_details(thread_ids: str, db: Session = Depends(get_db)):
    """
    Get comprehensive details for a list of thread IDs including all steps and node information
    Pass thread_ids as comma-separated string: ?thread_ids=T001,T003,T005
    """
    if not thread_ids:
        return []
    
    thread_id_list = thread_ids.split(',')
    thread_id_list = [tid.strip() for tid in thread_id_list]  # Remove any whitespace
    
    # Complex query joining all necessary tables
    query_results = (
        db.query(
            models.DecisionThreads.thread_id,
            models.DecisionThreads.protocol_id,
            models.DecisionThreads.final_outcome,
            models.DecisionThreadSteps.step_number,
            models.DecisionThreadSteps.node_id,
            models.DecisionThreadSteps.node_value_pair_description,
            models.NodeValuesQuestions.node_name,
            models.NodeValuesQuestions.node_category,
            models.NodeValuesQuestions.question,
            models.NodeValuesQuestions.value
        )
        .join(
            models.DecisionThreadSteps,
            models.DecisionThreads.thread_id == models.DecisionThreadSteps.thread_id
        )
        .outerjoin(
            models.NodeValuesQuestions,
            (models.DecisionThreads.protocol_id == models.NodeValuesQuestions.protocol_id) &
            (models.DecisionThreadSteps.node_id == models.NodeValuesQuestions.node_id)
        )
        .filter(models.DecisionThreads.thread_id.in_(thread_id_list))
        .order_by(models.DecisionThreads.thread_id, models.DecisionThreadSteps.step_number)
        .all()
    )
    
    # Group results by thread_id
    threads_dict = {}
    for row in query_results:
        thread_id = row.thread_id
        
        if thread_id not in threads_dict:
            threads_dict[thread_id] = {
                'thread_id': thread_id,
                'protocol_id': row.protocol_id,
                'final_outcome': row.final_outcome,
                'steps': []
            }
        
        # Add step details
        step_detail = ThreadStepDetail(
            step_number=row.step_number,
            node_id=row.node_id,
            node_name=row.node_name,
            node_category=row.node_category,
            question=row.question,
            value=row.value,
            node_value_pair_description=row.node_value_pair_description
        )
        
        threads_dict[thread_id]['steps'].append(step_detail)
    
    # Convert to list of ThreadDetail objects, maintaining order of input thread_ids
    result = []
    for thread_id in thread_id_list:
        if thread_id in threads_dict:
            thread_data = threads_dict[thread_id]
            result.append(ThreadDetail(**thread_data))
    
    return result

