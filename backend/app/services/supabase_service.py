import logging
from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)


def normalize_status(value: str | None) -> str | None:
    if not value:
        return value
    mapping = {
        'NEEDS_MORE_INFO': 'NEEDS_INFO',
    }
    upper = str(value).upper().strip()
    return mapping.get(upper, upper)


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
            item = response.data[0] if response.data else None
            if item:
                item['status'] = normalize_status(item.get('status'))
            return item
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
            item = response.data[0] if response.data else None
            if item:
                item['status'] = normalize_status(item.get('status'))
            return item
        except Exception:
            logger.exception('Failed to lookup candidate by gmail_message_id')
            return None

    async def list_candidates(self, status: str | None = None) -> list[dict]:
        try:
            query = self.client.table('candidates').select('*').order('created_at', desc=True)
            response = query.execute()
            rows = response.data or []
            for row in rows:
                row['status'] = normalize_status(row.get('status'))

            normalized_filter = normalize_status(status)
            if normalized_filter:
                rows = [row for row in rows if normalize_status(row.get('status')) == normalized_filter]

            return rows
        except Exception:
            logger.exception('Failed to list candidates from Supabase')
            return []

    async def list_followup_candidates(self) -> list[dict]:
        try:
            response = (
                self.client.table('candidates')
                .select('*')
                .in_('status', ['QUALIFIED', 'NEEDS_MORE_INFO', 'NEEDS_INFO', 'NEW', 'INTERVIEW_READY'])
                .execute()
            )
            rows = response.data or []
            for row in rows:
                row['status'] = normalize_status(row.get('status'))
            return rows
        except Exception:
            logger.exception('Failed to list followup candidates from Supabase')
            return []

    async def get_candidate_by_email(self, email: str) -> dict | None:
        if not email:
            return None
        try:
            response = self.client.table('candidates').select('*').eq('email', email).order('created_at', desc=True).limit(1).execute()
            item = response.data[0] if response.data else None
            if item:
                item['status'] = normalize_status(item.get('status'))
            return item
        except Exception:
            logger.exception('Failed to lookup candidate by email')
            return None

    async def list_table(self, table: str, limit: int = 100) -> list[dict]:
        try:
            response = self.client.table(table).select('*').limit(limit).execute()
            return response.data or []
        except Exception:
            logger.exception('Failed to list table from Supabase', extra={'table': table})
            return []

    async def get_by_id(self, table: str, item_id: str) -> dict | None:
        try:
            response = self.client.table(table).select('*').eq('id', item_id).limit(1).execute()
            return response.data[0] if response.data else None
        except Exception:
            logger.exception('Failed to get row by id', extra={'table': table, 'id': item_id})
            return None

    async def update_by_id(self, table: str, item_id: str, payload: dict) -> dict:
        try:
            response = self.client.table(table).update(payload).eq('id', item_id).execute()
            return response.data[0] if response.data else {}
        except Exception:
            logger.exception('Failed to update row by id', extra={'table': table, 'id': item_id})
            return {}

    async def insert_row(self, table: str, payload: dict) -> dict:
        try:
            response = self.client.table(table).insert(payload).execute()
            return response.data[0] if response.data else {}
        except Exception:
            logger.exception('Failed to insert row', extra={'table': table})
            return {}

    async def delete_candidate(self, candidate_id: str) -> bool:
        try:
            self.client.table('candidates').delete().eq('id', candidate_id).execute()
            return True
        except Exception:
            logger.exception('Failed to delete candidate from Supabase', extra={'id': candidate_id})
            return False

    async def delete_recent_candidates(self, minutes: int = 60) -> int:
        """Delete candidates created in the last N minutes."""
        try:
            from datetime import datetime, timedelta, timezone
            cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
            response = self.client.table('candidates').delete().gte('created_at', cutoff.isoformat()).execute()
            return len(response.data) if response.data else 0
        except Exception:
            logger.exception('Failed to delete recent candidates from Supabase')
            return 0

    async def clear_all_candidates(self) -> bool:
        """Delete ALL candidates from the database."""
        try:
            # Fetch all IDs first to bypass "delete without where" protections
            # and to handle potential foreign key issues more gracefully if needed.
            response = self.client.table('candidates').select('id').execute()
            all_ids = [row['id'] for row in response.data] if response.data else []
            
            if not all_ids:
                logger.info("No candidates to clear.")
                return True

            # Delete from candidates using the list of IDs
            # If there are many, we could chunk this, but for now we try all at once
            self.client.table('candidates').delete().in_('id', all_ids).execute()
            
            # Also clear activities as they are mostly related to candidates
            try:
                self.client.table('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
            except:
                pass

            return True
        except Exception as e:
            logger.exception('Failed to clear all candidates from Supabase')
            raise e
