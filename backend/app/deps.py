from app.services.ai_service import AIService
from app.services.email_service import EmailService
from app.services.parser_service import ParserService
from app.services.supabase_service import SupabaseService


def get_ai_service() -> AIService:
    return AIService()


def get_email_service() -> EmailService:
    return EmailService()


def get_parser_service() -> ParserService:
    return ParserService()


def get_supabase_service() -> SupabaseService:
    return SupabaseService()
