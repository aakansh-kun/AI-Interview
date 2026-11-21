from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from services.speech_service import SpeechService

router = APIRouter(prefix="/audio", tags=["Audio"])
speech_service = SpeechService()

@router.get("/preview/{interviewer_id}")
def get_voice_preview(interviewer_id: str):
    preview_data = speech_service.get_voice_preview(interviewer_id)
    return preview_data

@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty audio recording.")

    return {
        "status": "received",
        "sizeBytes": len(content),
        "mimeType": audio.content_type
    }
