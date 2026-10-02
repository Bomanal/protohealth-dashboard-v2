# ProtoHealth Dashboard

Operator dashboard for the ProtoHealth clinical triage voice agent. It lets clinical staff review
inbound triage conversations, review and edit triage protocols (thread × question matrix), queue
outbound patient calls, and watch the live FlowManager state of an in-progress triage call.

- **Frontend:** Vite + React + TypeScript + shadcn/ui (`src/`)
- **API:** FastAPI + SQLAlchemy on PostgreSQL (`main.py`, `database.py`, `src/api/`, `src/models.py`)
- **Worker:** Celery + Redis for protocol parsing (`src/celery_app/`, `src/protocol_engine/`)

## Running locally

Prerequisites: Node 18+, Python 3.11+, PostgreSQL with the existing schema, and Redis (worker only).

```sh
cp .env.example .env.local      # then fill in the values

# Frontend (http://localhost:8080; proxies /api, /case-list, /protocol... to the API)
npm ci
npm run dev

# API (http://localhost:8000)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Celery worker (protocol parsing; currently disabled, see Known limitations)
celery -A src.celery_app.celery_config:celery_app worker --loglevel=info
```

The `Procfile` runs all three together (e.g. with `honcho start` or `foreman start`).

Checks: `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm run build`.

## Environment variables

See `.env.example` for descriptions. Names only:

| Used by  | Variables |
|----------|-----------|
| Frontend | `VITE_DAILY_ROOM_URL`, `VITE_MONITOR_WS_URL`, `VITE_API_BASE_URL`*, `VITE_DEV_SERVER_PORT`* |
| API      | `CORS_ALLOWED_ORIGINS`, `DATABASE_URL` or `DB_USERNAME` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` / `DB_NAME` |
| Worker   | `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`, `REDIS_PASSWORD`, `GOOGLE_API_KEY` (plus the DB variables) |

\* Read by `vite.config.ts` from the shell environment, not from `.env` files.

## Live vs demo pages

| Page | Route | Data |
|------|-------|------|
| All Engagements | `/all-engagements` | Live (`GET /case-list`) |
| Patient Interaction Details | `/patient-interaction/:id` | Live (`GET /case-details/{session_id}`) |
| Visualize Protocol | `/visualize-protocol` | Live (`/protocol-names`, `/protocol/{id}/table-data`, `/protocol/{id}/batch-update`) |
| Create Protocol wizard | `/create-protocol` | Live API, but upload is disabled (see below) |
| Trigger Outbound Calls | `/trigger-outbound-calls` | Live (`/api/patients/...`, `/api/outbound-calls/batch`) |
| Visualize Inbound | `/visualize-inbound` | Live WebSocket (`VITE_MONITOR_WS_URL`) |
| Dashboard, Needs Action, Outbound Agents, Outbound Flow Details, Create Outbound Flow, Inbound Triage / Scheduling / Intake | `/`, `/needs-action`, `/outbound-agents/...`, `/inbound-*` | **Demo data** (hard-coded, marked with a "Demo data" badge) |

## Known limitations

- **No authentication or authorization yet.** Every API endpoint and page is open to anyone who can reach
  it. Do not expose this deployment to untrusted networks or load real PHI until auth lands
  (planned for the architecture phase).
- **Protocol upload is disabled.** `/protocol_engine/create|upload|status` return HTTP 501 until the
  `triage_protocols_list` schema decision is made (`protocol_internal_id`, `status` and `extra` were removed
  from the model). See `PROTOCOL_UPLOAD_ENABLED` in `src/api/protocol_engine.py`.
- There are no database migrations in this repo; the models mirror an externally managed schema.
- Outbound call dates/times are stored in UTC in tz-naive `DATE`/`TIME` columns.
- "Best time" scheduling is a placeholder (next day, 09:00 UTC).
- No automated tests yet.
