import os
import sys

# Ensure backend root is on sys.path for direct module imports in serverless runtimes
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load local environment variables (local development)
load_dotenv()

from services.gemini_service import GeminiService
from services.evaluation_service import EvaluationService
from services.interview_service import InterviewService

from api.interview import router as interview_router
from api.resume import router as resume_router
from api.audio import router as audio_router
from api.evaluation import router as evaluation_router

app = FastAPI(
    title="MineInterview AI Backend",
    description="Containerized AI/ML interview evaluation engine powered exclusively by Google Gemini.",
    version="1.0.0"
)

# CORS configuration for Vite local development and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core services
gemini_service = GeminiService()
evaluation_service = EvaluationService(gemini_service)
interview_service = InterviewService(gemini_service, evaluation_service)

# Attach API routers
app.include_router(interview_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(audio_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")

# Required standardized health check endpoint (Section 9)
@app.get("/health")
def health_root():
    return {
        "status": "healthy",
        "service": "mineinterview-backend",
        "gemini_connected": gemini_service.has_active_gemini(),
        "model": gemini_service.model_name
    }

@app.get("/api/health")
def health_api():
    return {
        "status": "healthy",
        "service": "mineinterview-backend",
        "gemini_connected": gemini_service.has_active_gemini(),
        "model": gemini_service.model_name
    }

@app.get("/")
def root():
    return {
        "name": "MineInterview AI Backend",
        "status": "online",
        "provider": "Google Gemini (exclusive)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
