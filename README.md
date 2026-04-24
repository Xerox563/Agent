# AI Recruiting Email Agent (MVP)

Production-ready MVP to ingest candidate emails, parse resumes, classify candidates, send follow-ups, and track interview scheduling signals.

## Stack

- Backend: FastAPI (Python)
- Frontend: Next.js + DaisyUI
- Database: Supabase
- AI: OpenRouter (free models)
- Automation: n8n webhooks
- Email: Gmail API

## Project Structure

- `backend/` FastAPI API + services
- `frontend/` Next.js dashboard
- `docs/supabase_schema.sql` schema for `candidates`
- `n8n/workflow.json` workflow starter

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Required Env Variables

### Backend `.env`

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_BASE_URL`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `GMAIL_CREDENTIALS_PATH`
- `GMAIL_TOKEN_PATH`
- `GMAIL_USER_ID`

### Frontend `.env.local`

- `NEXT_PUBLIC_API_BASE_URL`

## API Routes

- `POST /ingest-email`
- `POST /parse-resume`
- `POST /classify`
- `POST /send-screening`
- `POST /send-email`
- `POST /process-reply`
- `POST /schedule-interview`
- `POST /followups/run`
- `GET /candidates`
- `GET /health`

## Notes

- AI prompts enforce JSON-only responses.
- Supabase is used for candidate storage.
- Keep this MVP simple and iterative.
- Quick usage guide: `docs/how-to-use.md`
