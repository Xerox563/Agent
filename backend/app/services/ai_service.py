import json
import logging
import re

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def _extract_json_object(self, text: str) -> dict | None:
        # Handle common model outputs: fenced blocks, leading/trailing text, etc.
        candidate = text.strip()

        # Strip ```json fences
        if candidate.startswith('```'):
            candidate = re.sub(r'^```[a-zA-Z]*\n?', '', candidate)
            candidate = re.sub(r'\n?```$', '', candidate).strip()

        # Try direct parse first
        try:
            parsed = json.loads(candidate)
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            pass

        # Fallback: find the first JSON object in the text
        start = candidate.find('{')
        end = candidate.rfind('}')
        if start == -1 or end == -1 or end <= start:
            return None
        snippet = candidate[start : end + 1]
        try:
            parsed = json.loads(snippet)
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None

    async def json_completion(self, prompt: str) -> dict:
        headers = {
            'Authorization': f'Bearer {settings.openrouter_api_key}',
            'Content-Type': 'application/json',
        }
        messages = [
            {'role': 'system', 'content': 'Return valid JSON only. No extra text.'},
            {'role': 'user', 'content': prompt},
        ]

        async with httpx.AsyncClient(timeout=60) as client:
            for attempt in range(2):
                payload = {
                    'model': settings.openrouter_model,
                    'messages': messages,
                    'temperature': 0.1,
                }
                response = await client.post(
                    f"{settings.openrouter_base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                content = response.json()['choices'][0]['message']['content']

                parsed = self._extract_json_object(content)
                if parsed is not None:
                    return parsed

                # Retry once with an even stricter instruction
                messages = [
                    {
                        'role': 'system',
                        'content': 'You MUST return a single JSON object only. No markdown, no prose, no code fences.',
                    },
                    {'role': 'user', 'content': prompt},
                ]

        logger.error('Model did not return valid JSON', extra={'model_output_preview': content[:400] if content else ''})
        raise ValueError('Model did not return valid JSON')
