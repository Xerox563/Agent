# Backend (FastAPI)

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Routes

- `POST /ingest-email`
- `POST /parse-resume`
- `POST /classify`
- `POST /send-email`
- `POST /process-reply`
- `GET /candidates`
- `GET /health`
