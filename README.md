# ProtoHealth Dashboard

Operator dashboard for the ProtoHealth clinical triage voice agent. It lets clinical staff review
inbound triage conversations, review and edit triage protocols (thread × question matrix), queue
outbound patient calls, and watch the live FlowManager state of an in-progress triage call.

- **Frontend:** Vite + React + TypeScript + shadcn/ui (`src/`)
- **API:** FastAPI + SQLAlchemy on PostgreSQL (`main.py`, `database.py`, `src/api/`, `src/models.py`)
- **Protocol service:** protocol upload, generation, versioning and approval live in the backend repo
  (`Proto_triage_1/src/service`); this API proxies `/svc/*` to it (`src/api/protocol_service_proxy.py`)

## Running locally

Prerequisites: Node 18+, Python 3.11+, PostgreSQL with the backend's schema (`alembic upgrade head` in
Proto_triage_1), and the backend protocol service running (`PYTHONPATH=src uvicorn service.app:app --port 8100`).

```sh
cp .env.example .env.local      # then fill in the values

# Frontend (http://localhost:8080; proxies /api, /case-list, /protocol... to the API)
npm ci
npm run dev

# API (http://localhost:8000)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The `Procfile` runs both together (e.g. with `honcho start` or `foreman start`).

Checks: `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm run build`.

## Environment variables

See `.env.example` for descriptions. Names only:

| Used by  | Variables |
|----------|-----------|
| Frontend | `VITE_MONITOR_WS_URL`, `VITE_API_BASE_URL`*, `VITE_DEV_SERVER_PORT`* |
| API      | `CORS_ALLOWED_ORIGINS`, `DATABASE_URL` or `DB_USERNAME` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` / `DB_NAME`, `PROTOCOL_SERVICE_URL`, `SERVICE_API_KEY` |

\* Read by `vite.config.ts` from the shell environment, not from `.env` files.

## Live vs demo pages

| Page | Route | Data |
|------|-------|------|
| All Engagements | `/all-engagements` | Live (`GET /case-list`) |
| Patient Interaction Details | `/patient-interaction/:id` | Live (`GET /case-details/{session_id}`) |
| Visualize Protocol | `/visualize-protocol` | Live: matrix from `/protocol/{id}/table-data`; save = new draft and approve via `/svc/protocols/...` |
| Create Protocol wizard | `/create-protocol` | Live: inbound or outbound upload → generated draft → review (matrix / call scripts) → approve |
| Trigger Outbound Calls | `/trigger-outbound-calls` | Live: procedures from `/svc/protocols?kind=outbound`, rows via `/api/outbound-calls/batch`, "now" starts the call via `/svc/calls/outbound` |
| Visualize Inbound | `/visualize-inbound` | Live WebSocket (`VITE_MONITOR_WS_URL`) |
| Dashboard, Needs Action, Outbound Agents, Outbound Flow Details, Create Outbound Flow, Inbound Triage / Scheduling / Intake | `/`, `/needs-action`, `/outbound-agents/...`, `/inbound-*` | **Demo data** (hard-coded, marked with a "Demo data" badge) |

## Known limitations

- **No authentication or authorization yet.** Every API endpoint and page is open to anyone who can reach
  it. Do not expose this deployment to untrusted networks or load real PHI until auth lands
  (planned for the architecture phase).
- The matrix tables (`triage_protocols_list`, `protocol_threads`, `nodes`, `thread_node_values`,
  `thread_outcomes`) are a read model the protocol service projects from the versioned protocol store; edits go
  through the service, never directly to these tables. Calls run only an approved version.
- There are no database migrations in this repo: `src/models.py` is a copy of the backend's canonical models
  (Proto_triage_1/src/database_config/models.py), whose Alembic migrations own the schema.
- Outbound call dates/times are stored in UTC in tz-naive `DATE`/`TIME` columns.
- "Best time" scheduling is a placeholder (next day, 09:00 UTC).
- No automated tests yet.
