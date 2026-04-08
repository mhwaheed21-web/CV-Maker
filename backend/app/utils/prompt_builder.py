import json


SYSTEM_PROMPT = """You are an expert CV writer and ATS optimization specialist.

RULES — follow without exception:
1. Only use information explicitly provided in the user profile data.
   Do NOT invent, embellish, or add any experience, skills, companies,
   dates, or qualifications not present in the input.
2. Rewrite and rephrase the user's own content to be more professional,
   impactful, and keyword-aligned with the job description.
3. Select and prioritize sections and content most relevant to the JD.
4. Use strong action verbs. Quantify achievements where data supports it.
5. Return ONLY valid JSON matching the schema. No prose outside JSON.
"""

CV_JSON_SCHEMA = {
    "summary": "string — professional summary tailored to the JD",
    "sections": [
        {
            "type": "experience | education | skills | projects | certifications",
            "title": "string — section heading",
            "display_order": "integer — 1 is first",
            "items": [
                {
                    "heading": "string — main line e.g. Job Title — Company",
                    "subheading": "string — secondary line e.g. dates",
                    "bullets": ["string — bullet point"]
                }
            ]
        }
    ]
}


def build_user_prompt(profile: dict, job_description: str) -> str:
    return f"""JOB DESCRIPTION:
{job_description}

CANDIDATE PROFILE:
{json.dumps(profile, indent=2)}

TASK:
Generate a tailored CV as JSON following this exact schema:
{json.dumps(CV_JSON_SCHEMA, indent=2)}

Instructions:
- Prioritize experience and skills matching the JD
- Reorder sections so most relevant appears first
- Rewrite bullet points to align with JD keywords and ATS requirements
- Only use content from the CANDIDATE PROFILE above
- Return valid JSON only, no extra text
"""


def serialize_profile(profile: dict) -> dict:
    """Convert the full profile response into a clean dict for the AI prompt."""
    result = {}

    personal = profile.get("personal") or {}
    result["personal"] = {
        k: v for k, v in personal.items() if v
    }

    experience = profile.get("experience") or []
    result["experience"] = [
        {
            "job_title": e.get("job_title"),
            "company_name": e.get("company_name"),
            "start_date": e.get("start_date"),
            "end_date": e.get("end_date"),
            "is_current": e.get("is_current"),
            "responsibilities": e.get("responsibilities") or [],
        }
        for e in experience
    ]

    education = profile.get("education") or []
    result["education"] = [
        {
            "degree": e.get("degree"),
            "institution": e.get("institution"),
            "graduation_year": e.get("graduation_year"),
            "gpa": e.get("gpa"),
        }
        for e in education
    ]

    skills = profile.get("skills") or []
    result["skills"] = [
        {"name": s.get("name"), "category": s.get("category")}
        for s in skills
    ]

    projects = profile.get("projects") or []
    result["projects"] = [
        {
            "name": p.get("name"),
            "description": p.get("description"),
            "technologies": p.get("technologies") or [],
            "url": p.get("url"),
        }
        for p in projects
    ]

    certifications = profile.get("certifications") or []
    result["certifications"] = [
        {
            "name": c.get("name"),
            "issuer": c.get("issuer"),
            "issue_date": c.get("issue_date"),
        }
        for c in certifications
    ]

    return result