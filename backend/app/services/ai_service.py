from app.utils.prompt_builder import serialize_profile


MOCK_CV_CONTENT = {
    "summary": "Results-driven Software Engineer with 3+ years of experience building scalable web applications. Proven track record of delivering high-quality solutions using modern technologies. Strong background in backend development, API design, and cloud deployment.",
    "sections": [
        {
            "type": "experience",
            "title": "Work Experience",
            "display_order": 1,
            "items": [
                {
                    "heading": "Senior Software Engineer — Tech Solutions Ltd",
                    "subheading": "Jan 2022 – Present",
                    "bullets": [
                        "Led development of RESTful APIs serving 50,000+ daily active users",
                        "Reduced API response time by 40% through database query optimization",
                        "Mentored team of 3 junior developers, conducting code reviews",
                        "Implemented CI/CD pipelines reducing deployment time by 60%"
                    ]
                },
                {
                    "heading": "Software Engineer — Digital Agency",
                    "subheading": "Jun 2020 – Dec 2021",
                    "bullets": [
                        "Built and maintained 5 client-facing web applications using React and FastAPI",
                        "Integrated third-party payment systems handling $500K+ monthly transactions",
                        "Collaborated with cross-functional teams in an Agile environment"
                    ]
                }
            ]
        },
        {
            "type": "skills",
            "title": "Technical Skills",
            "display_order": 2,
            "items": [
                {
                    "heading": "Languages & Frameworks",
                    "subheading": None,
                    "bullets": ["Python", "JavaScript", "TypeScript", "React", "FastAPI", "Node.js"]
                },
                {
                    "heading": "Tools & Platforms",
                    "subheading": None,
                    "bullets": ["Docker", "PostgreSQL", "Redis", "AWS", "Git", "Linux"]
                }
            ]
        },
        {
            "type": "education",
            "title": "Education",
            "display_order": 3,
            "items": [
                {
                    "heading": "Bachelor of Science in Computer Science",
                    "subheading": "University of Technology — 2020",
                    "bullets": ["GPA: 3.8/4.0", "Dean's List — 3 consecutive semesters"]
                }
            ]
        },
        {
            "type": "projects",
            "title": "Projects",
            "display_order": 4,
            "items": [
                {
                    "heading": "E-Commerce Platform",
                    "subheading": "React · FastAPI · PostgreSQL · Docker",
                    "bullets": [
                        "Built full-stack e-commerce platform with real-time inventory management",
                        "Implemented JWT authentication and role-based access control",
                        "Deployed on AWS with auto-scaling handling 10,000 concurrent users"
                    ]
                }
            ]
        }
    ]
}


async def generate_cv_content(profile: dict, job_description: str) -> dict:
    """
    MOCK implementation — returns sample CV content.

    TO SWITCH TO REAL AI:
    1. Add your OpenAI API key to .env
    2. Replace this function with the real implementation below:

    from openai import AsyncOpenAI
    from app.config import settings
    from app.utils.prompt_builder import SYSTEM_PROMPT, build_user_prompt
    import json

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
    """
    serialized = serialize_profile(profile)
    print(f"[MOCK AI] Generating CV for profile with {len(serialized.get('experience', []))} experience entries")
    print(f"[MOCK AI] Job description length: {len(job_description)} characters")
    return MOCK_CV_CONTENT