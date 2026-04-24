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
        response = self.client.table('candidates').upsert(payload).execute()
        return response.data[0] if response.data else {}

    async def update_candidate(self, candidate_id: str, payload: dict) -> dict:
        response = self.client.table('candidates').update(payload).eq('id', candidate_id).execute()
        return response.data[0] if response.data else {}

    async def get_candidate(self, candidate_id: str) -> dict | None:
        response = self.client.table('candidates').select('*').eq('id', candidate_id).limit(1).execute()
        return response.data[0] if response.data else None

    async def list_candidates(self, status: str | None = None) -> list[dict]:
        query = self.client.table('candidates').select('*').order('created_at', desc=True)
        if status:
            query = query.eq('status', status)
        response = query.execute()
        return response.data or []

    async def list_followup_candidates(self) -> list[dict]:
        response = (
            self.client.table('candidates')
            .select('*')
            .in_('status', ['QUALIFIED', 'NEEDS_MORE_INFO', 'NEW'])
            .execute()
        )
        return response.data or []
