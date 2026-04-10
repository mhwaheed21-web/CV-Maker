import json
from openai import AsyncOpenAI
from app.config import settings
from app.utils.prompt_builder import SYSTEM_PROMPT, build_user_prompt, serialize_profile

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_cv_content(profile: dict, job_description: str) -> dict:
    serialized = serialize_profile(profile)
    response = await client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(serialized, job_description)}
        ]
    )
    return json.loads(response.choices[0].message.content)