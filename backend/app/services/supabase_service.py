import logging
from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseService:
    def __init__(self) -> None:
        if not settings.supabase_url or not settings.supabase_key:
            logger.warning('Supabase credentials are not set.')
        self.client: Client = create_client(settings.supabase_url, settings.supabase_key)

    async def upsert_candidate(self, payload: dict) -> dict:
        try:
            response = self.client.table('candidates').upsert(payload).execute()
            return response.data[0] if response.data else {}
        except Exception:
            logger.exception('Failed to upsert candidate in Supabase')
            return {}

    async def update_candidate(self, candidate_id: str, payload: dict) -> dict:
        try:
            response = self.client.table('candidates').update(payload).eq('id', candidate_id).execute()
            return response.data[0] if response.data else {}
        except Exception:
            logger.exception('Failed to update candidate in Supabase')
            return {}

    async def get_candidate(self, candidate_id: str) -> dict | None:
        try:
            response = self.client.table('candidates').select('*').eq('id', candidate_id).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception:
            logger.exception('Failed to get candidate from Supabase')
            return None

    async def get_candidate_by_gmail_message_id(self, gmail_message_id: str) -> dict | None:
        if not gmail_message_id:
            return None
        try:
            response = (
                self.client.table('candidates')
                .select('*')
                .eq('gmail_message_id', gmail_message_id)
                .limit(1)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception:
            logger.exception('Failed to lookup candidate by gmail_message_id')
            return None

    async def list_candidates(self, status: str | None = None) -> list[dict]:
        try:
            query = self.client.table('candidates').select('*').order('created_at', desc=True)
            if status:
                query = query.eq('status', status)
            response = query.execute()
            return response.data or []
        except Exception:
            logger.exception('Failed to list candidates from Supabase')
            return []

    async def list_followup_candidates(self) -> list[dict]:
        try:
            response = (
                self.client.table('candidates')
                .select('*')
                .in_('status', ['QUALIFIED', 'NEEDS_MORE_INFO', 'NEW'])
                .execute()
            )
            return response.data or []
        except Exception:
            logger.exception('Failed to list followup candidates from Supabase')
            return []
