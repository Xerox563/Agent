import json
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    async def json_completion(self, prompt: str) -> dict:
        headers = {
            'Authorization': f'Bearer {settings.openrouter_api_key}',
            'Content-Type': 'application/json',
        }
        payload = {
            'model': settings.openrouter_model,
            'messages': [
                {'role': 'system', 'content': 'Return valid JSON only. No extra text.'},
                {'role': 'user', 'content': prompt},
            ],
            'temperature': 0.2,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(f"{settings.openrouter_base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()['choices'][0]['message']['content']

        try:
            return json.loads(content)
        except json.JSONDecodeError as exc:
            logger.exception('Failed to decode model JSON output')
            raise ValueError('Model did not return valid JSON') from exc
