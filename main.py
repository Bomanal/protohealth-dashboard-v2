from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from src.api import case_list, case_details, create_protocol, protocol_service_proxy, patient_management, outbound_calls
# Load environment variables
load_dotenv(".env.local")

app = FastAPI()

# Comma-separated list of allowed browser origins. A wildcard is not allowed
# together with allow_credentials=True.
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:8080").split(",")
    if origin.strip() and origin.strip() != "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_details.router)
app.include_router(case_list.router)
app.include_router(create_protocol.router)
app.include_router(protocol_service_proxy.router)
app.include_router(patient_management.router)
app.include_router(outbound_calls.router)
