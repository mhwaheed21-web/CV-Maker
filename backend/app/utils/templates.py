TEMPLATE_METADATA = [
    {
        "id": "minimal",
        "name": "Minimal",
        "description": "Clean white single-column layout with classic typography.",
    },
    {
        "id": "modern",
        "name": "Modern",
        "description": "Two-column layout with dark sidebar and accent styling.",
    },
    {
        "id": "technical",
        "name": "Technical",
        "description": "Compact, skills-first layout with developer-focused styling.",
    },
    {
        "id": "creative",
        "name": "Creative",
        "description": "Bold header and visual hierarchy for creative roles.",
    },
    {
        "id": "executive",
        "name": "Executive",
        "description": "Formal, conservative layout with wide margins and serif typography.",
    },
]

ALLOWED_TEMPLATE_IDS = {template["id"] for template in TEMPLATE_METADATA}


def is_valid_template_id(template_id: str) -> bool:
    return template_id in ALLOWED_TEMPLATE_IDS
