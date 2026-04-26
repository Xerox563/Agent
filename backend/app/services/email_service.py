import base64
import os
import re
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from app.config import settings

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']


class EmailService:
    def _credentials(self) -> Credentials:
        creds = None
        try:
            creds = Credentials.from_authorized_user_file(settings.gmail_token_path, SCOPES)
        except Exception:
            creds = None

        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif not creds:
            flow = InstalledAppFlow.from_client_secrets_file(settings.gmail_credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
            with open(settings.gmail_token_path, 'w', encoding='utf-8') as token_file:
                token_file.write(creds.to_json())
        return creds

    def _service(self):
        return build('gmail', 'v1', credentials=self._credentials())

    async def fetch_unread(self, max_results: int = 10) -> list[dict]:
        service = self._service()
        # Search for unread emails that likely have attachments
        result = service.users().messages().list(userId=settings.gmail_user_id, q='is:unread', maxResults=max_results).execute()
        messages = result.get('messages', [])
        parsed = []

        for message_meta in messages:
            message = service.users().messages().get(userId=settings.gmail_user_id, id=message_meta['id']).execute()
            headers = {h['name']: h['value'] for h in message.get('payload', {}).get('headers', [])}
            subject = headers.get('Subject', '')

            # Filter by subject
            if not (subject.lower().startswith('subject for') or subject.lower().startswith('application for')):
                continue

            body = self._extract_body(message.get('payload', {}))
            attachments = self._extract_attachments(message.get('payload', {}))

            # Filter by attachment (must have at least one resume/pdf)
            has_resume = any(
                a.get('filename', '').lower().endswith('.pdf') or a.get('mimeType') == 'application/pdf'
                for a in attachments
            )
            if not has_resume:
                continue

            parsed.append(
                {
                    'gmail_message_id': message['id'],
                    'email': self._extract_email(headers.get('From', '')),
                    'subject': subject,
                    'body': body,
                    'attachments': attachments,
                    'status': 'NEW',
                }
            )

        return parsed

    async def fetch_unread_text_replies(self, max_results: int = 10) -> list[dict]:
        # Prefer emails without attachments (candidate replies)
        service = self._service()
        result = service.users().messages().list(
            userId=settings.gmail_user_id,
            q='is:unread -has:attachment',
            maxResults=max_results,
        ).execute()
        messages = result.get('messages', [])
        parsed = []

        for message_meta in messages:
            message = service.users().messages().get(userId=settings.gmail_user_id, id=message_meta['id']).execute()
            headers = {h['name']: h['value'] for h in message.get('payload', {}).get('headers', [])}
            body = self._extract_body(message.get('payload', {}))
            parsed.append(
                {
                    'gmail_message_id': message['id'],
                    'email': self._extract_email(headers.get('From', '')),
                    'subject': headers.get('Subject', ''),
                    'body': body,
                }
            )
        return parsed

    async def mark_as_read(self, gmail_message_id: str) -> None:
        if not gmail_message_id:
            return
        service = self._service()
        service.users().messages().modify(
            userId=settings.gmail_user_id,
            id=gmail_message_id,
            body={'removeLabelIds': ['UNREAD']},
        ).execute()

    async def send_email(self, to: str, subject: str, body: str) -> dict:
        service = self._service()
        msg = MIMEText(body)
        msg['to'] = to
        msg['subject'] = subject
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

        sent = service.users().messages().send(userId=settings.gmail_user_id, body={'raw': raw}).execute()
        return {'id': sent.get('id'), 'threadId': sent.get('threadId')}

    def _extract_body(self, payload: dict) -> str:
        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                    data = part['body']['data']
                    return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        data = payload.get('body', {}).get('data')
        if data:
            return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
        return ''

    def _extract_attachments(self, payload: dict) -> list[dict]:
        attachments = []
        for part in payload.get('parts', []):
            filename = part.get('filename')
            body = part.get('body', {})
            attachment_id = body.get('attachmentId')
            if filename and attachment_id:
                attachments.append({'filename': filename, 'attachment_id': attachment_id, 'mimeType': part.get('mimeType', '')})
            if part.get('parts'):
                attachments.extend(self._extract_attachments(part))
        return attachments

    async def download_pdf_attachments(self, gmail_message_id: str, attachments: list[dict], target_dir: str) -> list[str]:
        service = self._service()
        output_paths: list[str] = []
        Path(target_dir).mkdir(parents=True, exist_ok=True)

        for attachment in attachments:
            filename = attachment.get('filename', '')
            attachment_id = attachment.get('attachment_id')
            mime_type = attachment.get('mimeType', '')
            if not attachment_id:
                continue
            if not filename.lower().endswith('.pdf') and mime_type != 'application/pdf':
                continue

            api_response = (
                service.users()
                .messages()
                .attachments()
                .get(userId=settings.gmail_user_id, messageId=gmail_message_id, id=attachment_id)
                .execute()
            )
            data = api_response.get('data')
            if not data:
                continue
            pdf_bytes = base64.urlsafe_b64decode(data.encode('utf-8'))

            safe_name = re.sub(r'[^A-Za-z0-9_.-]', '_', filename or f'{attachment_id}.pdf')
            file_path = os.path.join(target_dir, safe_name)
            with open(file_path, 'wb') as file_obj:
                file_obj.write(pdf_bytes)
            output_paths.append(file_path)

        return output_paths

    def _extract_email(self, from_header: str) -> str:
        match = re.search(r'<([^>]+)>', from_header)
        if match:
            return match.group(1).strip()
        return from_header.strip()
