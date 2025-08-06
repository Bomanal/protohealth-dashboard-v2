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

class ThreadDetailItem(BaseModel):
    thread_id: str
    protocol_id: str
    final_condition: Optional[str]
    triage_outcome: Optional[str]
    nodes: List[dict]  # Will contain node details

class ThreadNodeDetail(BaseModel):
    node_id: str
    question: str
    node_name: str
    node_category: str
    node_value: str  # The answer/value chosen for this thread

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

@router.get("/protocol/{protocol_id}/complete-details", response_model=dict)
def get_complete_protocol_details(protocol_id: str, db: Session = Depends(get_db)):
    """
    Get complete details for all threads in a protocol: final conditions + all nodes with questions and values
    """
    
    # First, verify protocol exists
    protocol_exists = (
        db.query(models.TriageProtocolsList)
        .filter(models.TriageProtocolsList.protocol_id == protocol_id)
        .first()
    )
    
    if not protocol_exists:
        raise HTTPException(status_code=404, detail="Protocol not found")
    
    # Get all threads for this protocol with their outcomes
    thread_info_list = (
        db.query(
            models.ProtocolThreads.thread_id,
            models.ProtocolThreads.protocol_id,
            models.ThreadOutcomes.final_condition,
            models.ThreadOutcomes.triage_outcome
        )
        .outerjoin(
            models.ThreadOutcomes,
            models.ProtocolThreads.thread_id == models.ThreadOutcomes.thread_id
        )
        .filter(models.ProtocolThreads.protocol_id == protocol_id)
        .all()
    )
    
    # Get all node details for all threads in this protocol
    all_node_details = (
        db.query(
            models.ThreadNodeValues.thread_id,
            models.ThreadNodeValues.node_id,
            models.ThreadNodeValues.node_value,
            models.Nodes.question,
            models.Nodes.node_name,
            models.Nodes.node_category
        )
        .join(
            models.Nodes,
            models.ThreadNodeValues.node_id == models.Nodes.node_id
        )
        .join(
            models.ProtocolThreads,
            models.ThreadNodeValues.thread_id == models.ProtocolThreads.thread_id
        )
        .filter(models.ProtocolThreads.protocol_id == protocol_id)
        .all()
    )
    
    # Group node details by thread_id
    node_details_by_thread = {}
    for node in all_node_details:
        if node.thread_id not in node_details_by_thread:
            node_details_by_thread[node.thread_id] = []
        node_details_by_thread[node.thread_id].append({
            "node_id": node.node_id,
            "question": node.question,
            "node_name": node.node_name,
            "node_category": node.node_category,
            "node_value": node.node_value
        })
    
    # Build response
    threads = []
    for thread_info in thread_info_list:
        threads.append({
            "thread_id": thread_info.thread_id,
            "final_condition": thread_info.final_condition,
            "triage_outcome": thread_info.triage_outcome,
            "nodes": node_details_by_thread.get(thread_info.thread_id, [])
        })
    
    return {
        "protocol_id": protocol_id,
        "protocol_name": protocol_exists.protocol_name,
        "protocol_description": protocol_exists.protocol_description,
        "total_threads": len(threads),
        "threads": threads
    }

@router.get("/protocol/{protocol_id}/table-data", response_model=dict)
def get_protocol_table_data(protocol_id: str, db: Session = Depends(get_db)):
    """
    Get data formatted for a table: threads as rows, node questions as columns
    """
    
    # Get all data in one query
    results = (
        db.query(
            models.ProtocolThreads.thread_id,
            models.ThreadOutcomes.final_condition,
            models.ThreadOutcomes.triage_outcome,
            models.Nodes.node_id,
            models.Nodes.question,
            models.ThreadNodeValues.node_value
        )
        .join(
            models.ThreadNodeValues,
            models.ProtocolThreads.thread_id == models.ThreadNodeValues.thread_id
        )
        .join(
            models.Nodes,
            models.ThreadNodeValues.node_id == models.Nodes.node_id
        )
        .outerjoin(
            models.ThreadOutcomes,
            models.ProtocolThreads.thread_id == models.ThreadOutcomes.thread_id
        )
        .filter(models.ProtocolThreads.protocol_id == protocol_id)
        .all()
    )
    
    if not results:
        raise HTTPException(status_code=404, detail="No data found for protocol")
    
    # Get unique questions (columns)
    questions = {}
    threads = {}
    
    for row in results:
        # Collect unique questions
        questions[row.node_id] = row.question
        
        # Collect thread info and values
        if row.thread_id not in threads:
            threads[row.thread_id] = {
                "thread_id": row.thread_id,
                "final_condition": row.final_condition,
                "triage_outcome": row.triage_outcome,
                "values": {}
            }
        threads[row.thread_id]["values"][row.node_id] = row.node_value
    
    return {
        "protocol_id": protocol_id,
        "questions": questions,  # {node_id: question}
        "threads": list(threads.values())  # List of threads with their values
    }

