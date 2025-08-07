from celery import Celery
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(".env.local")

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_DB = os.getenv("REDIS_DB", "0")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

# Construct Redis URL
if REDIS_PASSWORD:
    REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
else:
    REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

# Create Celery instance
celery_app = Celery(
    "protohealth_dashboard",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "src.celery_app.tasks.protocol_tasks",
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # Results expire after 1 hour
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
    # Task routing
    task_routes={
        "src.celery_app.tasks.protocol_tasks.*": {"queue": "protocol_queue"},
    },
    # Default queue
    task_default_queue="default",
    # Queue definitions
    task_queues={
        "default": {
            "exchange": "default",
            "routing_key": "default",
        },
        "protocol_queue": {
            "exchange": "protocol",
            "routing_key": "protocol",
        },
    },
)

# Health check task
@celery_app.task
def health_check():
    """Simple health check task for monitoring Celery workers"""
    return {"status": "healthy", "message": "Celery worker is running"}