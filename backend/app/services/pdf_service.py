from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import os


TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")


def render_cv_html(cv_content: dict, user: dict, template_id: str = "minimal") -> str:
    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
    template = env.get_template(f"template_{template_id}.html")

    personal = user.get("personal") or {}

    context = {
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "phone": personal.get("phone", ""),
        "location": personal.get("location", ""),
        "linkedin_url": personal.get("linkedin_url", ""),
        "portfolio_url": personal.get("portfolio_url", ""),
        "summary": cv_content.get("summary", ""),
        "sections": cv_content.get("sections", []),
    }

    return template.render(**context)


def generate_pdf(html_content: str) -> bytes:
    import io
    pdf_file = io.BytesIO()
    HTML(string=html_content).write_pdf(pdf_file)
    pdf_bytes = pdf_file.getvalue()
    return pdf_bytes