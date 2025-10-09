from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import text
import time

from src import models
from database import get_db
from src.celery_app.tasks.protocol_tasks import parse_protocol, get_protocol_task_status_by_protocol_id

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
        # Check if protocol_internal_id already exists
        existing_protocol = db.query(models.TriageProtocolsList).filter(
            models.TriageProtocolsList.protocol_internal_id == request.protocol_internal_id
        ).first()
        
        if existing_protocol:
            raise HTTPException(
                status_code=400,
                detail=f"Protocol with internal ID '{request.protocol_internal_id}' already exists"
            )
        
        # Generate sequential protocol_id (P001, P002, etc.)
        result = db.execute(text("SELECT MAX(CAST(SUBSTRING(protocol_id, 2) AS INTEGER)) FROM triage_protocols_list"))
        max_id = result.scalar()
        protocol_id = f"P{(max_id or 0) + 1:03d}"
        
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

class UploadProtocolResponse(BaseModel):
    protocol_id: str
    protocol_internal_id: str
    task_id: str
    message: str

@router.post("/upload/{protocol_internal_id}", response_model=UploadProtocolResponse)
async def upload_protocol_data(
    protocol_internal_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload protocol data file and trigger Celery parsing task.
    
    Args:
        protocol_internal_id: Internal ID of the protocol to upload data for
        file: Uploaded text file containing protocol data
        db: Database session
    
    Returns:
        UploadProtocolResponse with task details
    """
    try:
        # Validate file type
        if not file.filename.endswith('.txt'):
            raise HTTPException(
                status_code=400,
                detail="Only .txt files are supported"
            )
        
        # Check if protocol exists
        protocol = db.query(models.TriageProtocolsList).filter(
            models.TriageProtocolsList.protocol_internal_id == protocol_internal_id
        ).first()
        
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol with internal ID '{protocol_internal_id}' not found"
            )
        
        # Read file content
        try:
            file_content = await file.read()
            file_content_str = file_content.decode('utf-8')
        except UnicodeDecodeError:
            raise HTTPException(
                status_code=400,
                detail="File must be a valid UTF-8 encoded text file"
            )
        
        # Check if protocol is already being processed
        if protocol.status in ['PROCESSING']:
            raise HTTPException(
                status_code=409,
                detail=f"Protocol is already being processed. Current status: {protocol.status}"
            )
        
        # Trigger Celery task
        task = parse_protocol.delay(protocol.protocol_internal_id, file_content_str)
        
        # Update protocol status and store task_id
        protocol.status = 'PROCESSING'

        if protocol.extra is None:
            protocol.extra = {}
        protocol.extra['celery_task_id'] = task.id
        protocol.extra['upload_timestamp'] = time.time()
        protocol.extra['uploaded_filename'] = file.filename
        protocol.extra['protocol_id'] = protocol.protocol_id  # Store for easy lookup
        
        db.commit()
        
        return UploadProtocolResponse(
            protocol_id=protocol.protocol_id,
            protocol_internal_id=protocol.protocol_internal_id,
            task_id=task.id,
            message="Protocol data uploaded and parsing task started successfully"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading protocol data: {str(e)}"
        )

@router.get("/status/{protocol_internal_id}")
def get_protocol_status(protocol_internal_id: str, db: Session = Depends(get_db)):
    """
    Get the status of a protocol and its associated Celery task.
    
    Args:
        protocol_internal_id: Internal ID of the protocol
        db: Database session
    
    Returns:
        Dictionary with protocol and task status information
    """
    try:
        # Find protocol by internal_id
        protocol = db.query(models.TriageProtocolsList).filter(
            models.TriageProtocolsList.protocol_internal_id == protocol_internal_id
        ).first()
        
        if not protocol:
            raise HTTPException(
                status_code=404,
                detail=f"Protocol with internal ID '{protocol_internal_id}' not found"
            )
        
        # Get task status using the existing Celery task function
        task_status = get_protocol_task_status_by_protocol_id(protocol.protocol_id)
        
        return {
            "protocol_internal_id": protocol_internal_id,
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.protocol_name,
            "protocol_status": protocol.status,
            "task_status": task_status
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting protocol status: {str(e)}"
        )