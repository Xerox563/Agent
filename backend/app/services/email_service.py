import base64
from email.mime.text import MIMEText

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
        result = service.users().messages().list(userId=settings.gmail_user_id, q='is:unread', maxResults=max_results).execute()
        messages = result.get('messages', [])
        parsed = []

        for message_meta in messages:
            message = service.users().messages().get(userId=settings.gmail_user_id, id=message_meta['id']).execute()
            headers = {h['name']: h['value'] for h in message.get('payload', {}).get('headers', [])}
            body = self._extract_body(message.get('payload', {}))
            attachments = self._extract_attachments(message.get('payload', {}))
            parsed.append(
                {
                    'gmail_message_id': message['id'],
                    'email': headers.get('From', ''),
                    'subject': headers.get('Subject', ''),
                    'body': body,
                    'attachments': attachments,
                    'status': 'NEW',
                }
            )

        return parsed

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
        return attachments
