import io
from typing import Optional
import pypdf

class ResumeService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error parsing PDF resume: {e}")
            return ""

    @staticmethod
    def clean_resume_text(raw_text: str, max_chars: int = 4000) -> str:
        if not raw_text:
            return ""
        # Collapse excessive whitespace
        cleaned = " ".join(raw_text.split())
        if len(cleaned) > max_chars:
            cleaned = cleaned[:max_chars] + "... [resume truncated for length]"
        return cleaned
