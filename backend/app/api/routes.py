import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_ai_service, get_email_service, get_parser_service, get_supabase_service
from app.models import (
    CandidateStatusUpdateRequest,
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


@router.get('/api/candidates')
async def list_candidates_v2(
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: SupabaseService = Depends(get_supabase_service),
):
    candidates = await db.list_candidates(status=status if status and status != 'ALL' else None)
    if search:
        search_term = search.strip().lower()
        candidates = [
            row for row in candidates if search_term in str(row.get('name', '')).lower() or search_term in str(row.get('email', '')).lower()
        ]

    total = len(candidates)
    start = (page - 1) * page_size
    paged = candidates[start : start + page_size]
    return {'items': paged, 'pagination': {'page': page, 'page_size': page_size, 'total': total}}


@router.get('/api/candidates/{candidate_id}')
async def get_candidate_v2(candidate_id: str, db: SupabaseService = Depends(get_supabase_service)):
    candidate = await db.get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')
    return {'item': candidate}


@router.patch('/api/candidates/{candidate_id}/status')
async def update_candidate_status(
    candidate_id: str,
    payload: CandidateStatusUpdateRequest,
    db: SupabaseService = Depends(get_supabase_service),
):
    candidate = await db.get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')
    updated = await db.update_candidate(candidate_id, {'status': payload.status, 'updated_at': datetime.now(timezone.utc).isoformat()})
    return {'item': updated}


@router.get('/api/dashboard/summary')
async def dashboard_summary(db: SupabaseService = Depends(get_supabase_service)):
    candidates = await db.list_candidates()
    total = len(candidates)
    qualified = len([c for c in candidates if c.get('status') == 'QUALIFIED'])
    rejected = len([c for c in candidates if c.get('status') == 'REJECTED'])
    needs_info = len([c for c in candidates if c.get('status') == 'NEEDS_MORE_INFO'])
    interview_ready = len([c for c in candidates if c.get('status') == 'INTERVIEW_READY'])
    scored = [int(c.get('score')) for c in candidates if c.get('score') is not None]
    avg_score = round(sum(scored) / len(scored), 1) if scored else 0
    jobs = await db.list_table('jobs', limit=200)

    return {
        'total_candidates': total,
        'qualified': qualified,
        'rejected': rejected,
        'needs_info': needs_info,
        'interview_ready': interview_ready,
        'avg_score': avg_score,
        'open_jobs': len([j for j in jobs if str(j.get('status', 'ACTIVE')).upper() == 'ACTIVE']),
    }


@router.get('/api/dashboard/pipeline')
async def dashboard_pipeline(db: SupabaseService = Depends(get_supabase_service)):
    candidates = await db.list_candidates()
    total = len(candidates)
    stages = [
        {'stage': 'Emails Received', 'value': total},
        {'stage': 'Applications Identified', 'value': len([c for c in candidates if c.get('classification') != 'NON_APPLICATION'])},
        {'stage': 'Screened', 'value': len([c for c in candidates if c.get('score') is not None])},
        {'stage': 'Qualified', 'value': len([c for c in candidates if c.get('status') == 'QUALIFIED'])},
        {'stage': 'Hired', 'value': len([c for c in candidates if c.get('status') == 'HIRED'])},
    ]
    return {'stages': stages}


@router.get('/api/dashboard/activity')
async def dashboard_activity(db: SupabaseService = Depends(get_supabase_service)):
    activities = await db.list_table('activities', limit=20)
    if activities:
        return {'items': activities}

    # If activity table is not available yet, fallback to candidate updates from DB.
    candidates = await db.list_candidates()
    fallback = [
        {
            'id': row.get('id'),
            'message': f"{row.get('name') or row.get('email', 'Candidate')} marked as {row.get('status', 'NEW')}",
            'created_at': row.get('updated_at') or row.get('created_at'),
        }
        for row in candidates[:10]
    ]
    return {'items': fallback}


@router.get('/api/dashboard/skills')
async def dashboard_skills(db: SupabaseService = Depends(get_supabase_service)):
    candidates = await db.list_candidates()
    counter: dict[str, int] = {}
    for row in candidates:
        skills = row.get('skills') or []
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]
        if not isinstance(skills, list):
            continue
        for skill in skills:
            key = str(skill).strip()
            if not key:
                continue
            counter[key] = counter.get(key, 0) + 1
    top = sorted(counter.items(), key=lambda kv: kv[1], reverse=True)[:8]
    return {'items': [{'skill': name, 'count': count} for name, count in top]}


@router.get('/api/dashboard/trends')
async def dashboard_trends(db: SupabaseService = Depends(get_supabase_service)):
    candidates = await db.list_candidates()
    buckets: dict[str, dict[str, int]] = {}
    for row in candidates:
        created_at = str(row.get('created_at') or '')[:10]
        if not created_at:
            continue
        if created_at not in buckets:
            buckets[created_at] = {'received': 0, 'qualified': 0, 'rejected': 0}
        buckets[created_at]['received'] += 1
        status = str(row.get('status') or '').upper()
        if status == 'QUALIFIED':
            buckets[created_at]['qualified'] += 1
        if status == 'REJECTED':
            buckets[created_at]['rejected'] += 1
    series = [{'date': date, **values} for date, values in sorted(buckets.items(), key=lambda kv: kv[0])][-30:]
    return {'items': series}


@router.get('/api/dashboard/recent-candidates')
async def dashboard_recent_candidates(db: SupabaseService = Depends(get_supabase_service)):
    candidates = await db.list_candidates()
    return {'items': candidates[:10]}


@router.get('/api/emails')
async def list_emails(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('emails', limit=100)}


@router.get('/api/emails/{email_id}')
async def get_email(email_id: str, db: SupabaseService = Depends(get_supabase_service)):
    item = await db.get_by_id('emails', email_id)
    if not item:
        raise HTTPException(status_code=404, detail='Email not found')
    return {'item': item}


@router.post('/api/emails/process')
async def process_email(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    created = await db.insert_row('email_process_logs', {'payload': payload, 'status': 'QUEUED', 'created_at': datetime.now(timezone.utc).isoformat()})
    return {'item': created}


@router.get('/api/analytics')
async def analytics(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('analytics', limit=100)}


@router.get('/api/analytics/reports')
async def analytics_reports(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('analytics_reports', limit=100)}


@router.get('/api/jobs')
async def list_jobs(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('jobs', limit=200)}


@router.post('/api/jobs')
async def create_job(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    created = await db.insert_row('jobs', payload)
    return {'item': created}


@router.patch('/api/jobs/{job_id}')
async def update_job(job_id: str, payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    updated = await db.update_by_id('jobs', job_id, payload)
    return {'item': updated}


@router.get('/api/automation')
async def list_automation(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('automation_rules', limit=200)}


@router.post('/api/automation')
async def create_automation(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    created = await db.insert_row('automation_rules', payload)
    return {'item': created}


@router.get('/api/templates')
async def list_templates(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('templates', limit=200)}


@router.post('/api/templates')
async def create_template(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    created = await db.insert_row('templates', payload)
    return {'item': created}


@router.get('/api/integrations')
async def list_integrations(db: SupabaseService = Depends(get_supabase_service)):
    return {'items': await db.list_table('integrations', limit=100)}


@router.post('/api/integrations/connect')
async def connect_integration(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    created = await db.insert_row('integration_logs', {'payload': payload, 'status': 'REQUESTED', 'created_at': datetime.now(timezone.utc).isoformat()})
    return {'item': created}


@router.get('/api/settings')
async def get_settings(db: SupabaseService = Depends(get_supabase_service)):
    items = await db.list_table('settings', limit=1)
    return {'item': items[0] if items else {}}


@router.patch('/api/settings')
async def update_settings(payload: dict, db: SupabaseService = Depends(get_supabase_service)):
    items = await db.list_table('settings', limit=1)
    if not items:
        created = await db.insert_row('settings', payload)
        return {'item': created}
    updated = await db.update_by_id('settings', items[0].get('id'), payload)
    return {'item': updated}
