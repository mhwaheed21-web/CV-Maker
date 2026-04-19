class CVMakerError(Exception):
    status_code = 500
    default_detail = "An unexpected error occurred."

    def __init__(self, detail: str | None = None):
        super().__init__(detail or self.default_detail)
        self.detail = detail or self.default_detail


class CVGenerationError(CVMakerError):
    default_detail = "CV generation failed."


class AIServiceError(CVMakerError):
    default_detail = "AI service failed."


class PDFRenderError(CVMakerError):
    default_detail = "PDF generation failed."


class TemplateNotFoundError(CVMakerError):
    status_code = 422
    default_detail = "Template not found."


def format_error_message(error: Exception) -> str:
    return f"{error.__class__.__name__}: {error}"


def build_error_payload(error: Exception) -> dict:
    return {
        "detail": getattr(error, "detail", str(error)),
        "error_type": error.__class__.__name__,
    }