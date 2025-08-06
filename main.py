from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from src.api import case_list,case_details,create_protocol,protocol_celery_api,protocol_engine
# Load environment variables
load_dotenv(".env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_details.router)
app.include_router(case_list.router)
app.include_router(create_protocol.router)
app.include_router(protocol_celery_api.router)
app.include_router(protocol_engine.router)
