"""Forward /svc/* to the backend protocol service (Proto_triage_1/src/service), adding its API key server-side.

The protocol service owns protocol upload, generation, versioning, edits and approval; the matrix tables this
dashboard reads (see create_protocol.py) are a projection it maintains. Proxying keeps SERVICE_API_KEY out of the
browser and avoids CORS between the two origins.

Env: PROTOCOL_SERVICE_URL (default http://localhost:8100), SERVICE_API_KEY (optional, sent as X-API-Key).
"""

import os

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

router = APIRouter(prefix="/svc", tags=["protocol-service"])

SERVICE_URL = os.getenv("PROTOCOL_SERVICE_URL", "http://localhost:8100").rstrip("/")
FORWARDED_HEADERS = ("content-type", "accept")
ALLOWED_PREFIXES = ("protocols", "calls", "health")


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT"])
async def forward(path: str, request: Request) -> Response:
    if not path.split("/", 1)[0] in ALLOWED_PREFIXES:
        raise HTTPException(404, "not found")
    headers = {k: v for k, v in request.headers.items() if k.lower() in FORWARDED_HEADERS}
    if os.getenv("SERVICE_API_KEY"):
        headers["X-API-Key"] = os.environ["SERVICE_API_KEY"]
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            upstream = await client.request(request.method, f"{SERVICE_URL}/{path}", params=request.query_params,
                                            content=await request.body(), headers=headers)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"protocol service unavailable ({type(e).__name__})")
    return Response(content=upstream.content, status_code=upstream.status_code,
                    media_type=upstream.headers.get("content-type"))
