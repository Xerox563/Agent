import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_ai_service, get_email_service, get_parser_service, get_supabase_service
from app.models import (
    CandidateClassifyRequest,
    IngestEmailRequest,
    ParseResumeRequest,
    ProcessReplyRequest,
    ScheduleInterviewRequest,
    SendEmailRequest,
    SendFollowupsRequest,
    SendScreeningRequest,
)
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


@router.post('/send-screening')
async def send_screening_email(
    payload: SendScreeningRequest,
    db: SupabaseService = Depends(get_supabase_service),
    email_service: EmailService = Depends(get_email_service),
):
    candidate = await db.get_candidate(payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')
    if candidate.get('status') == 'REJECTED':
        return {'sent': False, 'reason': 'Candidate is rejected'}

    body = (
        'Hi,\n\n'
        'Thanks for your interest. Please share:\n'
        '- Expected salary\n'
        '- Notice period\n'
        '- Availability for interview this week\n\n'
        'Best regards,\nRecruitment Team'
    )
    sent = await email_service.send_email(candidate['email'], 'Quick screening questions', body)
    updated = await db.update_candidate(payload.candidate_id, {'last_email_sent_at': datetime.now(timezone.utc).isoformat()})
    return {'sent': sent, 'candidate': updated}


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


@router.post('/schedule-interview')
async def schedule_interview(
    payload: ScheduleInterviewRequest,
    db: SupabaseService = Depends(get_supabase_service),
    email_service: EmailService = Depends(get_email_service),
):
    candidate = await db.get_candidate(payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')

    lines = '\n'.join([f'- {slot}' for slot in payload.time_slots])
    body = (
        'Hi,\n\n'
        'Please confirm one of these interview slots:\n'
        f'{lines}\n\n'
        'Reply with your preferred slot.\n\n'
        'Best regards,\nRecruitment Team'
    )
    sent = await email_service.send_email(candidate['email'], 'Interview scheduling', body)
    updated = await db.update_candidate(
        payload.candidate_id,
        {'proposed_slots': payload.time_slots, 'last_email_sent_at': datetime.now(timezone.utc).isoformat()},
    )
    return {'sent': sent, 'candidate': updated}


@router.post('/followups/run')
async def run_followups(
    payload: SendFollowupsRequest,
    db: SupabaseService = Depends(get_supabase_service),
    email_service: EmailService = Depends(get_email_service),
):
    candidates = await db.list_followup_candidates()
    now = datetime.now(timezone.utc)
    reminder_cutoff = now - timedelta(hours=payload.reminder_after_hours)
    final_cutoff = now - timedelta(hours=payload.final_after_hours)

    reminders_sent = 0
    finals_sent = 0
    skipped = 0

    for candidate in candidates:
        if candidate.get('expected_salary') and candidate.get('notice_period'):
            skipped += 1
            continue

        created_at = candidate.get('created_at')
        if not created_at:
            skipped += 1
            continue

        created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        followup_stage = candidate.get('followup_stage', 'NONE')

        if created <= final_cutoff and followup_stage != 'FINAL':
            body = (
                'Hi,\n\n'
                'Final reminder: please share your expected salary and notice period.\n'
                'We will close this application soon.\n\n'
                'Best regards,\nRecruitment Team'
            )
            await email_service.send_email(candidate['email'], 'Final reminder', body)
            await db.update_candidate(candidate['id'], {'followup_stage': 'FINAL', 'last_email_sent_at': now.isoformat()})
            finals_sent += 1
            continue

        if created <= reminder_cutoff and followup_stage == 'NONE':
            body = (
                'Hi,\n\n'
                'Quick reminder to share your expected salary and notice period.\n\n'
                'Best regards,\nRecruitment Team'
            )
            await email_service.send_email(candidate['email'], 'Reminder: screening details', body)
            await db.update_candidate(candidate['id'], {'followup_stage': 'REMINDER_1', 'last_email_sent_at': now.isoformat()})
            reminders_sent += 1
            continue

        skipped += 1

    return {'reminders_sent': reminders_sent, 'finals_sent': finals_sent, 'skipped': skipped}


@router.get('/candidates')
async def list_candidates(status: str | None = Query(default=None), db: SupabaseService = Depends(get_supabase_service)):
    return {'candidates': await db.list_candidates(status=status)}
