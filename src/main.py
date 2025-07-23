from fastapi import FastAPI
from .api.outbound_flows import router as outbound_flows_router
from .api.patients import router as patients_router
from .api.patient_interactions import router as patient_interactions_router

app = FastAPI()

app.include_router(outbound_flows_router)
app.include_router(patients_router)
app.include_router(patient_interactions_router)