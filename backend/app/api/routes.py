import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_ai_service, get_email_service, get_parser_service, get_supabase_service
from app.models import CandidateClassifyRequest, IngestEmailRequest, ParseResumeRequest, ProcessReplyRequest, SendEmailRequest
from app.services.ai_service import AIService
from app.services.email_service import EmailService
from app.services.parser_service import ParserService
from app.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/ingest-email')
async def ingest_email(
    payload: IngestEmailRequest,
    email_service: EmailService = Depends(get_email_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    emails = await email_service.fetch_unread(max_results=payload.max_results)
    saved = []
    for email in emails:
        candidate = {**email, 'id': str(uuid.uuid4())}
        saved.append(await db.upsert_candidate(candidate))
    return {'count': len(saved), 'candidates': saved}


@router.post('/parse-resume')
async def parse_resume(
    payload: ParseResumeRequest,
    parser: ParserService = Depends(get_parser_service),
    ai_service: AIService = Depends(get_ai_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    text = await parser.pdf_to_text(payload.attachment_path)
    prompt = (
        'Extract candidate info and return JSON only with keys: '
        'name, experience, role, skills. Resume text:\n\n'
        f'{text}'
    )
    parsed = await ai_service.json_completion(prompt)
    updated = await db.update_candidate(payload.candidate_id, parsed)
    return {'candidate': updated, 'parsed': parsed}


@router.post('/classify')
async def classify_candidate(
    payload: CandidateClassifyRequest,
    ai_service: AIService = Depends(get_ai_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    candidate = await db.get_candidate(payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')

    prompt = (
        'Classify this candidate. Return JSON only with keys: status, score, summary. '
        "Allowed status values: QUALIFIED, REJECTED, NEEDS_MORE_INFO. Candidate:\n\n"
        f'{candidate}'
    )
    result = await ai_service.json_completion(prompt)
    updated = await db.update_candidate(payload.candidate_id, result)
    return {'candidate': updated}


@router.post('/send-email')
async def send_email(payload: SendEmailRequest, email_service: EmailService = Depends(get_email_service)):
    result = await email_service.send_email(payload.to, payload.subject, payload.body)
    return {'sent': result}


@router.post('/process-reply')
async def process_reply(
    payload: ProcessReplyRequest,
    ai_service: AIService = Depends(get_ai_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    prompt = (
        'Extract expected_salary, notice_period, availability_slot from this reply and return JSON only. '
        f'Reply:\n\n{payload.reply_body}'
    )
    extracted = await ai_service.json_completion(prompt)
    updated = await db.update_candidate(payload.candidate_id, extracted)
    return {'candidate': updated, 'extracted': extracted}


@router.get('/candidates')
async def list_candidates(status: str | None = Query(default=None), db: SupabaseService = Depends(get_supabase_service)):
    return {'candidates': await db.list_candidates(status=status)}
