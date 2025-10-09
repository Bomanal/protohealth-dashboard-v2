backend: uvicorn main:app --reload --host 0.0.0.0 --port 8000
worker: celery -A src.celery_app.celery_config:celery_app worker --loglevel=info
frontend: npm run dev
