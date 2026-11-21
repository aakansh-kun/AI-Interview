from fastapi import APIRouter, UploadFile, File, HTTPException
from services.resume_service import ResumeService

router = APIRouter(prefix="/resume", tags=["Resume"])

MAX_RESUME_SIZE = 10 * 1024 * 1024  # 10MB limit

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not (filename.lower().endswith(".pdf") or filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF or plain text resume files are supported.")

    content = await file.read()
    if len(content) > MAX_RESUME_SIZE:
        raise HTTPException(status_code=400, detail="Resume file exceeds 10MB limit.")

    if filename.lower().endswith(".pdf"):
        extracted_text = ResumeService.extract_text_from_pdf(content)
    else:
        try:
            extracted_text = content.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = ""

    cleaned_text = ResumeService.clean_resume_text(extracted_text)

    if not cleaned_text:
        raise HTTPException(status_code=422, detail="Could not extract readable text from the uploaded resume.")

    return {
        "filename": filename,
        "charCount": len(cleaned_text),
        "preview": cleaned_text[:300] + ("..." if len(cleaned_text) > 300 else ""),
        "fullText": cleaned_text
    }
