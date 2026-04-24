# How To Use (Quick)

## 1) Start backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install email-validator
cp .env.example .env
python -m uvicorn app.main:app --reload
```

## 2) Create Supabase table

Run `docs/supabase_schema.sql` inside Supabase SQL editor.

Without this table, dashboard candidate list will stay empty.

## 3) Start frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 4) Basic flow

- Open `/dashboard`
- Use backend docs at `http://localhost:8000/docs`
- Trigger `POST /pipeline/run` to ingest + classify + screening
- Refresh dashboard to see candidates

## 5) Common issues

- **Address already in use:** stop old server on port 8000
- **Module not found:** activate correct `.venv` and reinstall requirements
- **Empty dashboard:** check Supabase keys and table creation
