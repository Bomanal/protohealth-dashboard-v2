from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import time

from src import models
from database import get_db

router = APIRouter(prefix="/protocol_engine", tags=["protocol_engine"])

class CreateProtocolRequest(BaseModel):
    protocol_internal_id: str
    protocol_name: Optional[str] = None
    protocol_description: Optional[str] = None

class CreateProtocolResponse(BaseModel):
    protocol_id: str
    protocol_internal_id: str
    protocol_name: Optional[str]
    protocol_description: Optional[str]
    message: str

@router.post("/create", response_model=CreateProtocolResponse)
def create_protocol(
    request: CreateProtocolRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new entry in TriageProtocolsList.
    
    Args:
        request: Contains protocol_internal_id (mandatory), protocol_name and protocol_description (optional)
        db: Database session
    
    Returns:
        CreateProtocolResponse with the created protocol details
    """
    try:
        # Generate a short protocol_id (4 chars max for primary key)
        timestamp = int(time.time())
        protocol_id = str(timestamp)[-4:]  # Take last 4 digits of timestamp
        
        # Check if protocol_internal_id already exists
        existing_protocol = db.query(models.TriageProtocolsList).filter(
            models.TriageProtocolsList.protocol_internal_id == request.protocol_internal_id
        ).first()
        
        if existing_protocol:
            raise HTTPException(
                status_code=400,
                detail=f"Protocol with internal ID '{request.protocol_internal_id}' already exists"
            )
            
        # Check if protocol_id already exists (handle collision)
        existing_protocol_id = db.query(models.TriageProtocolsList).filter(
            models.TriageProtocolsList.protocol_id == protocol_id
        ).first()
        
        if existing_protocol_id:
            # If collision, add a random suffix
            import random
            protocol_id = f"{protocol_id[:-1]}{random.randint(0, 9)}"
        
        # Create new protocol entry
        new_protocol = models.TriageProtocolsList(
            protocol_id=protocol_id,
            protocol_internal_id=request.protocol_internal_id,
            protocol_name=request.protocol_name or "",
            protocol_description=request.protocol_description or ""
        )
        
        # Add to database
        db.add(new_protocol)
        db.commit()
        db.refresh(new_protocol)
        
        return CreateProtocolResponse(
            protocol_id=new_protocol.protocol_id,
            protocol_internal_id=new_protocol.protocol_internal_id,
            protocol_name=new_protocol.protocol_name,
            protocol_description=new_protocol.protocol_description,
            message="Protocol created successfully"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other database or general errors
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating the protocol: {str(e)}"
        )