from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = 'Recruiting Agent API'
    openrouter_api_key: str = ''
    openrouter_model: str = 'mistralai/mistral-7b-instruct:free'
    openrouter_base_url: str = 'https://openrouter.ai/api/v1'

    supabase_url: str = ''
    supabase_key: str = ''

    gmail_credentials_path: str = 'gmail_credentials.json'
    gmail_token_path: str = 'gmail_token.json'
    gmail_user_id: str = 'me'


settings = Settings()
