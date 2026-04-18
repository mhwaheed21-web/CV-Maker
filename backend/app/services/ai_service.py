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


async def generate_chat_action(cv_content: dict, contact_info: dict, user_message: str) -> dict:
    system_prompt = """You are a CV editing assistant.

You can handle two kinds of requests:
1) CV content edits (summary/sections/items)
2) Contact/profile edits (email, phone, location, linkedin_url, portfolio_url)

Return ONLY valid JSON with this exact shape:
{
  "assistant_reply": "string",
  "target": "cv_content" | "profile" | "none",
  "cv_updated": true_or_false,
  "profile_updates": {
    "email": "string_or_null",
    "phone": "string_or_null",
    "location": "string_or_null",
    "linkedin_url": "string_or_null",
    "portfolio_url": "string_or_null"
  },
  "updated_cv_content": {
    "summary": "string",
    "sections": []
  }
}

Rules:
1. Keep output as valid JSON only.
2. For profile/contact requests, set target="profile" and fill only changed fields in profile_updates.
3. For cv edits, set target="cv_content" and return full updated_cv_content.
4. If unclear, set target="none", cv_updated=false, and keep updated_cv_content unchanged.
5. Never invent user data.
"""

    user_prompt = f"""CURRENT_CV_JSON:
{json.dumps(cv_content, indent=2)}

CURRENT_CONTACT_INFO:
{json.dumps(contact_info, indent=2)}

USER_REQUEST:
{user_message}
"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return json.loads(response.choices[0].message.content)