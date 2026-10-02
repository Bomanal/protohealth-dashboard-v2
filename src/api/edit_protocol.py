
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone

from src import models
from database import get_db
from src.api.error_logging import log_error

router = APIRouter()
logger = logging.getLogger(__name__)

class UpdateThreadNodeValue(BaseModel):
    thread_id: str
    node_id: str
    node_value: str

class UpdateThreadAcceptance(BaseModel):
    thread_id: str
    acceptance: bool

@router.put("/protocol/{protocol_id}/update-thread-node")
def update_thread_node_value(protocol_id: str, update_data: UpdateThreadNodeValue, db: Session = Depends(get_db)):
    """
    Update a specific thread-node value and update modified_at timestamp
    """
    # Verify the thread belongs to this protocol
    thread_exists = (
        db.query(models.ProtocolThreads)
        .filter(models.ProtocolThreads.protocol_id == protocol_id)
        .filter(models.ProtocolThreads.thread_id == update_data.thread_id)
        .first()
    )
    
    if not thread_exists:
        raise HTTPException(status_code=404, detail="Thread not found in this protocol")
    
    # Update or create the thread_node_values record
    result = (
        db.query(models.ThreadNodeValues)
        .filter(models.ThreadNodeValues.thread_id == update_data.thread_id)
        .filter(models.ThreadNodeValues.node_id == update_data.node_id)
        .first()
    )
    
    if result:
        # Update existing record
        result.node_value = update_data.node_value
        message = "Updated successfully"
    else:
        # Create new record if it doesn't exist
        new_record = models.ThreadNodeValues(
            thread_id=update_data.thread_id,
            node_id=update_data.node_id,
            node_value=update_data.node_value
        )
        db.add(new_record)
        message = "Created successfully"
    
    # Update the modified_at timestamp in thread_outcomes
    thread_outcome = (
        db.query(models.ThreadOutcomes)
        .filter(models.ThreadOutcomes.thread_id == update_data.thread_id)
        .first()
    )
    
    if thread_outcome:
        thread_outcome.modified_at = datetime.utcnow()
    else:
        # Create thread_outcomes record if it doesn't exist
        new_outcome = models.ThreadOutcomes(
            thread_id=update_data.thread_id,
            modified_at=datetime.utcnow()
        )
        db.add(new_outcome)
    
    db.commit()
    return {
        "message": message, 
        "thread_id": update_data.thread_id, 
        "node_id": update_data.node_id,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.put("/protocol/{protocol_id}/update-thread-acceptance")
def update_thread_acceptance(protocol_id: str, update_data: UpdateThreadAcceptance, db: Session = Depends(get_db)):
    """
    Update thread acceptance status and modified_at timestamp
    """
    try:
        # Verify the thread belongs to this protocol
        thread_exists = (
            db.query(models.ProtocolThreads)
            .filter(models.ProtocolThreads.protocol_id == protocol_id)
            .filter(models.ProtocolThreads.thread_id == update_data.thread_id)
            .first()
        )
        
        if not thread_exists:
            raise HTTPException(status_code=404, detail="Thread not found in this protocol")
        
        # Update or create the thread_outcomes record
        thread_outcome = (
            db.query(models.ThreadOutcomes)
            .filter(models.ThreadOutcomes.thread_id == update_data.thread_id)
            .first()
        )
        
        if thread_outcome:
            # Update existing record
            thread_outcome.acceptance = update_data.acceptance
            thread_outcome.modified_at = datetime.utcnow()
            message = "Acceptance updated successfully"
        else:
            # Create new record if it doesn't exist
            new_outcome = models.ThreadOutcomes(
                thread_id=update_data.thread_id,
                acceptance=update_data.acceptance,
                modified_at=datetime.utcnow()
            )
            db.add(new_outcome)
            message = "Acceptance created successfully"
        
        db.commit()  # Explicit commit
        
        return {
            "message": message,
            "thread_id": update_data.thread_id,
            "acceptance": update_data.acceptance,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        log_error(logger, "update_thread_acceptance failed", e)
        raise HTTPException(status_code=500, detail="Failed to update acceptance")

@router.put("/protocol/{protocol_id}/batch-update")
def batch_update_thread_data(protocol_id: str, updates: dict, db: Session = Depends(get_db)):
    """
    Batch update multiple thread changes at once
    """
    results = []
    
    try:
        # Process node value updates
        if "node_updates" in updates:
            for update in updates["node_updates"]:
                thread_id = update["thread_id"]
                node_id = update["node_id"]
                node_value = update["node_value"]
                
                # Verify the thread belongs to this protocol
                thread_exists = (
                    db.query(models.ProtocolThreads)
                    .filter(models.ProtocolThreads.protocol_id == protocol_id)
                    .filter(models.ProtocolThreads.thread_id == thread_id)
                    .first()
                )
                
                if not thread_exists:
                    results.append({"type": "node_update", "error": f"Thread {thread_id} not found", "data": update})
                    continue
                
                # Update or create the thread_node_values record
                result = (
                    db.query(models.ThreadNodeValues)
                    .filter(models.ThreadNodeValues.thread_id == thread_id)
                    .filter(models.ThreadNodeValues.node_id == node_id)
                    .first()
                )
                
                if result:
                    result.node_value = node_value
                    message = "Updated successfully"
                else:
                    new_record = models.ThreadNodeValues(
                        thread_id=thread_id,
                        node_id=node_id,
                        node_value=node_value
                    )
                    db.add(new_record)
                    message = "Created successfully"
                
                # Update modified_at timestamp
                thread_outcome = (
                    db.query(models.ThreadOutcomes)
                    .filter(models.ThreadOutcomes.thread_id == thread_id)
                    .first()
                )
                
                if thread_outcome:
                    thread_outcome.modified_at = datetime.utcnow()
                else:
                    new_outcome = models.ThreadOutcomes(
                        thread_id=thread_id,
                        modified_at=datetime.utcnow()
                    )
                    db.add(new_outcome)
                
                results.append({"type": "node_update", "result": {"message": message, "thread_id": thread_id, "node_id": node_id}})
        
        # Process acceptance updates
        if "acceptance_updates" in updates:
            for update in updates["acceptance_updates"]:
                thread_id = update["thread_id"]
                acceptance = update["acceptance"]
                
                # Verify the thread belongs to this protocol
                thread_exists = (
                    db.query(models.ProtocolThreads)
                    .filter(models.ProtocolThreads.protocol_id == protocol_id)
                    .filter(models.ProtocolThreads.thread_id == thread_id)
                    .first()
                )
                
                if not thread_exists:
                    results.append({"type": "acceptance_update", "error": f"Thread {thread_id} not found", "data": update})
                    continue
                
                # Update or create the thread_outcomes record
                thread_outcome = (
                    db.query(models.ThreadOutcomes)
                    .filter(models.ThreadOutcomes.thread_id == thread_id)
                    .first()
                )
                
                if thread_outcome:
                    thread_outcome.acceptance = acceptance
                    thread_outcome.modified_at = datetime.utcnow()
                    message = "Acceptance updated successfully"
                else:
                    new_outcome = models.ThreadOutcomes(
                        thread_id=thread_id,
                        acceptance=acceptance,
                        modified_at=datetime.utcnow()
                    )
                    db.add(new_outcome)
                    message = "Acceptance created successfully"
                
                results.append({"type": "acceptance_update", "result": {"message": message, "thread_id": thread_id, "acceptance": acceptance}})
        
        # Commit all changes at once
        db.commit()
        
        # Per-item errors (e.g. unknown thread) are reported inside batch_results with an "error" key;
        # status is "partial" when any item failed so clients can keep those changes pending.
        has_errors = any("error" in r for r in results)
        return {"batch_results": results, "status": "partial" if has_errors else "success", "total_updates": len(results)}
        
    except Exception as e:
        # Nothing was committed: report a real error status so clients keep their pending changes
        db.rollback()
        log_error(logger, "batch_update_thread_data failed", e)
        raise HTTPException(status_code=500, detail="Batch update failed; no changes were saved")