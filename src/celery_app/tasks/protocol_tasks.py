from src.celery_app.celery_config import celery_app
from sqlalchemy.orm import Session
from database import SessionLocal
import logging
from typing import Dict, Any

# Import your protocol parser and models
from src.protocol_engine.protocol_parser import ProtocolParser
from src.models import TriageProtocolsList

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def parse_protocol(self, protocol_id: str, uploaded_file_content: str) -> Dict[str, Any]:
    """
    Simple task to parse a protocol using ProtocolParser
    
    Args:
        protocol_id: ID of the TriageProtocolsList to process
        uploaded_file_content: Content of the uploaded protocol file
        
    Returns:
        Dictionary with parsing results
    """
    try:
        db_session = SessionLocal()
        
        try:
            # Get the protocol from database
            protocol = db_session.query(TriageProtocolsList).filter_by(
                protocol_id=protocol_id
            ).first()
            
            if not protocol:
                logger.error(f"Protocol with ID {protocol_id} not found")
                return {
                    "success": False, 
                    "message": f"Protocol with ID {protocol_id} not found",
                    "protocol_id": protocol_id
                }
            
            # Store task_id in the protocol's extra field
            task_id = self.request.id
            if protocol.extra is None:
                protocol.extra = {}
            protocol.extra['celery_task_id'] = task_id
            protocol.extra['processing_started_at'] = 'now'
            protocol.status = 'PROCESSING'
            db_session.commit()
            
            logger.info(f"Started processing protocol {protocol_id} with task_id {task_id}")
            
            # Create parser and run parse method
            parser = ProtocolParser(protocol, uploaded_file_content)
            result = parser.parse()
            
            # Update protocol with final status and result
            if result.get('success', False):
                protocol.status = 'COMPLETED'
                protocol.extra['processing_completed_at'] = 'now'
                protocol.extra['processing_result'] = result
            else:
                protocol.status = 'FAILED'
                protocol.extra['processing_completed_at'] = 'now'
                protocol.extra['processing_error'] = result.get('message', 'Unknown error')
            
            db_session.commit()
            
            logger.info(f"Protocol parsing completed for {protocol_id}: {result.get('success', False)}")
            return result
            
        finally:
            db_session.close()
        
    except Exception as exc:
        # Update protocol status to FAILED on exception
        try:
            db_session = SessionLocal()
            protocol = db_session.query(TriageProtocolsList).filter_by(
                protocol_id=protocol_id
            ).first()
            if protocol:
                protocol.status = 'FAILED'
                if protocol.extra is None:
                    protocol.extra = {}
                protocol.extra['processing_error'] = str(exc)
                protocol.extra['processing_completed_at'] = 'now'
                db_session.commit()
        except Exception as update_error:
            logger.error(f"Failed to update protocol status: {update_error}")
        finally:
            if 'db_session' in locals():
                db_session.close()
        
        logger.error(f"Protocol parsing task failed for {protocol_id}: {str(exc)}")
        return {
            "success": False,
            "message": str(exc),
            "protocol_id": protocol_id
        }

@celery_app.task
def get_protocol_task_status_by_protocol_id(protocol_id: str) -> Dict[str, Any]:
    """
    Get the Celery task status for a protocol using the stored task_id
    
    Args:
        protocol_id: ID of the protocol
        
    Returns:
        Dictionary with task status and protocol info
    """
    try:
        db_session = SessionLocal()
        
        try:
            protocol = db_session.query(TriageProtocolsList).filter_by(
                protocol_id=protocol_id
            ).first()
            
            if not protocol:
                return {
                    'found': False,
                    'message': f'Protocol {protocol_id} not found'
                }
            
            # Check if protocol has a task_id stored
            if not protocol.extra or 'celery_task_id' not in protocol.extra:
                return {
                    'found': True,
                    'protocol_id': protocol_id,
                    'protocol_name': protocol.protocol_name,
                    'status': protocol.status,
                    'task_status': 'NO_TASK',
                    'message': 'No Celery task associated with this protocol'
                }
            
            task_id = protocol.extra['celery_task_id']
            
            # Get task status from Celery
            task_result = celery_app.AsyncResult(task_id)
            
            return {
                'found': True,
                'protocol_id': protocol_id,
                'protocol_name': protocol.protocol_name,
                'protocol_status': protocol.status,
                'task_id': task_id,
                'task_status': task_result.status,
                'processing_started_at': protocol.extra.get('processing_started_at'),
                'processing_completed_at': protocol.extra.get('processing_completed_at'),
                'result': task_result.result if task_result.ready() and task_result.successful() else None,
                'error': str(task_result.info) if task_result.ready() and not task_result.successful() else None
            }
            
        finally:
            db_session.close()
            
    except Exception as exc:
        logger.error(f"Failed to get protocol task status for {protocol_id}: {str(exc)}")
        return {
            'found': False,
            'error': str(exc),
            'message': f'Error retrieving task status for protocol {protocol_id}'
        }