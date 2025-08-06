
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src import models
from database import get_db

router = APIRouter()

class UpdateThreadNodeValue(BaseModel):
    thread_id: str
    node_id: str
    node_value: str

@router.put("/protocol/{protocol_id}/update-thread-node")
def update_thread_node_value(protocol_id: str, update_data: UpdateThreadNodeValue, db: Session = Depends(get_db)):
    """
    Update a specific thread-node value
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
    
    # Update the thread_node_values table
    result = (
        db.query(models.ThreadNodeValues)
        .filter(models.ThreadNodeValues.thread_id == update_data.thread_id)
        .filter(models.ThreadNodeValues.node_id == update_data.node_id)
        .first()
    )
    
    if result:
        # Update existing record
        result.node_value = update_data.node_value
        db.commit()
        return {"message": "Updated successfully", "thread_id": update_data.thread_id, "node_id": update_data.node_id}
    else:
        # Create new record if it doesn't exist
        new_record = models.ThreadNodeValues(
            thread_id=update_data.thread_id,
            node_id=update_data.node_id,
            node_value=update_data.node_value
        )
        db.add(new_record)
        db.commit()
        return {"message": "Created successfully", "thread_id": update_data.thread_id, "node_id": update_data.node_id}