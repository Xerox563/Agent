import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_ai_service, get_email_service, get_parser_service, get_supabase_service
from app.models import (
    CandidateClassifyRequest,
    IngestEmailRequest,
    ParseResumeRequest,
    PipelineRunRequest,
    ProcessReplyRequest,
    ScheduleInterviewRequest,
    SendEmailRequest,
    SendFollowupsRequest,
    RepliesRunRequest,
    SendScreeningRequest,
)
from app.services.ai_service import AIService
from app.services.email_service import EmailService
from app.services.parser_service import ParserService
from app.services.supabase_service import SupabaseService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/pipeline/run')
async def run_pipeline(
    payload: PipelineRunRequest,
    email_service: EmailService = Depends(get_email_service),
    ai_service: AIService = Depends(get_ai_service),
    parser: ParserService = Depends(get_parser_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    emails = await email_service.fetch_unread(max_results=payload.max_results)
    created = []
    classified = []
    screening_sent = 0
    resumes_parsed = 0
    skipped_without_resume = 0
    resume_dir = os.path.join('/tmp', 'agent_resumes')
    already_seen = 0
    errors = 0

    for email in emails:
        existing = await db.get_candidate_by_gmail_message_id(email.get('gmail_message_id', ''))
        if existing:
            already_seen += 1
            await email_service.mark_as_read(email.get('gmail_message_id', ''))
            continue

        candidate = {**email, 'id': str(uuid.uuid4())}
        saved = await db.upsert_candidate(candidate)
        if not saved:
            errors += 1
            continue
        created.append(saved)

        try:
            pdf_paths = await email_service.download_pdf_attachments(
                gmail_message_id=saved.get('gmail_message_id', ''),
                attachments=saved.get('attachments', []),
                target_dir=resume_dir,
            )

            if pdf_paths:
                resume_text = await parser.pdf_to_text(pdf_paths[0])
                parse_prompt = (
                    'Extract candidate info and return JSON only with keys: '
                    'name, experience, role, skills. Resume text:\n\n'
                    f'{resume_text}'
                )
                parsed = await ai_service.json_completion(parse_prompt)
                saved = await db.update_candidate(saved['id'], parsed)
                resumes_parsed += 1
            else:
                skipped_without_resume += 1

            prompt = (
                'Classify this candidate. Return JSON only with keys: status, score, summary. '
                "Allowed status values: QUALIFIED, REJECTED, NEEDS_MORE_INFO. Candidate:\n\n"
                f'{saved}'
            )
            result = await ai_service.json_completion(prompt)
            updated = await db.update_candidate(saved['id'], result)
            classified.append(updated)

            if updated.get('status') != 'REJECTED':
                body = (
                    'Hi,\n\n'
                    'Thanks for your interest. Please share:\n'
                    '- Expected salary\n'
                    '- Notice period\n'
                    '- Availability for interview this week\n\n'
                    'Best regards,\nRecruitment Team'
                )
                await email_service.send_email(updated['email'], 'Quick screening questions', body)
                screening_sent += 1
        except Exception:
            logger.exception('Pipeline failed for message', extra={'gmail_message_id': saved.get('gmail_message_id')})
            errors += 1
        finally:
            await email_service.mark_as_read(email.get('gmail_message_id', ''))

    return {
        'ingested': len(created),
        'resumes_parsed': resumes_parsed,
        'skipped_without_resume': skipped_without_resume,
        'already_seen': already_seen,
        'classified': len(classified),
        'screening_sent': screening_sent,
        'errors': errors,
    }


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
    try:
        candidates = await db.list_followup_candidates()
    except Exception:
        logger.exception('Failed to load followup candidates')
        return {'reminders_sent': 0, 'finals_sent': 0, 'skipped': 0, 'errors': 1}

    now = datetime.now(timezone.utc)
    reminder_cutoff = now - timedelta(hours=payload.reminder_after_hours)
    final_cutoff = now - timedelta(hours=payload.final_after_hours)

    reminders_sent = 0
    finals_sent = 0
    skipped = 0
    errors = 0

    for candidate in candidates:
        try:
            if candidate.get('expected_salary') and candidate.get('notice_period'):
                skipped += 1
                continue

            created_at = candidate.get('created_at')
            if not created_at:
                skipped += 1
                continue

            # created_at may vary in format depending on Supabase/PostgREST serialization
            created_at_norm = str(created_at).replace('Z', '+00:00')
            try:
                created = datetime.fromisoformat(created_at_norm)
            except ValueError:
                skipped += 1
                continue

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
        except Exception:
            logger.exception('Followup processing failed for candidate', extra={'candidate_id': candidate.get('id')})
            errors += 1

    return {'reminders_sent': reminders_sent, 'finals_sent': finals_sent, 'skipped': skipped, 'errors': errors}


@router.post('/replies/run')
async def run_replies(
    payload: RepliesRunRequest,
    email_service: EmailService = Depends(get_email_service),
    ai_service: AIService = Depends(get_ai_service),
    db: SupabaseService = Depends(get_supabase_service),
):
    replies = await email_service.fetch_unread_text_replies(max_results=payload.max_results)
    processed = 0
    matched = 0
    updated = 0
    skipped = 0
    errors = 0

    for reply in replies:
        processed += 1
        try:
            sender = reply.get('email', '')
            if not sender:
                skipped += 1
                await email_service.mark_as_read(reply.get('gmail_message_id', ''))
                continue

            candidate = await db.get_candidate_by_email(sender)
            if not candidate:
                skipped += 1
                await email_service.mark_as_read(reply.get('gmail_message_id', ''))
                continue

            matched += 1
            prompt = (
                'Extract expected_salary, notice_period, availability_slot from this reply and return JSON only. '
                f"Reply subject: {reply.get('subject','')}\n\nReply body:\n{reply.get('body','')}"
            )
            extracted = await ai_service.json_completion(prompt)
            result = await db.update_candidate(candidate['id'], extracted)
            if result:
                updated += 1
        except Exception:
            errors += 1
            logger.exception('Reply processing failed', extra={'gmail_message_id': reply.get('gmail_message_id')})
        finally:
            await email_service.mark_as_read(reply.get('gmail_message_id', ''))

    return {'processed': processed, 'matched': matched, 'updated': updated, 'skipped': skipped, 'errors': errors}


@router.get('/candidates')
async def list_candidates(status: str | None = Query(default=None), db: SupabaseService = Depends(get_supabase_service)):
    return {'candidates': await db.list_candidates(status=status)}
