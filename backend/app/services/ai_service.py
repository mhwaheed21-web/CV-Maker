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


async def generate_chat_edit(cv_content: dict, user_message: str) -> dict:
        system_prompt = """You are a CV editing assistant.

You will receive the current CV JSON and a user edit request.

Return ONLY valid JSON with this exact shape:
{
    "assistant_reply": "string",
    "cv_updated": true_or_false,
    "updated_cv_content": {
        "summary": "string",
        "sections": [
            {
                "type": "experience|education|skills|projects|certifications",
                "title": "string",
                "display_order": integer,
                "items": [
                    {
                        "heading": "string",
                        "subheading": "string",
                        "bullets": ["string"]
                    }
                ]
            }
        ]
    }
}

Rules:
1. Keep output as valid JSON only.
2. If request is unclear or cannot be safely applied, set cv_updated=false and return the original cv_content in updated_cv_content.
3. Do not remove required fields summary or sections.
4. Keep schema compatible with the provided CV JSON.
"""

        user_prompt = f"""CURRENT_CV_JSON:
{json.dumps(cv_content, indent=2)}

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