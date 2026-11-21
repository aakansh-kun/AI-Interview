from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time

class SkinConfig(BaseModel):
    hairColor: str = "#4a2e18"
    eyeColor: str = "#2b53a7"
    skinColor: str = "#d8a47f"
    shirtColor: str = "#2e5b88"
    jacketColor: Optional[str] = "#1e3d5b"
    tieColor: Optional[str] = "#a82828"
    hairStyle: str = "short"  # short, long, parted, modern
    accentColor: str = "#ffffff"

class InterviewerConfig(BaseModel):
    id: str
    name: str
    title: str
    personality: str
    voice: str  # e.g., 'Kore', 'Fenrir', 'Puck', 'Aoede' (Gemini voices) or WebSpeech config
    accentPreference: str
    styleNotes: str
    systemPrompt: str
    skinConfig: SkinConfig

class Turn(BaseModel):
    role: str  # "interviewer" or "candidate"
    content: str
    timestamp: float = Field(default_factory=time.time)
    isFollowUp: bool = False
    questionIndex: Optional[int] = None
    durationSeconds: Optional[float] = None

class CreateInterviewRequest(BaseModel):
    role: str = "Software Engineer"
    experience: str = "Mid-Level"  # Fresher, Junior, Mid-Level, Senior
    interviewType: str = "Technical Interview"  # Technical, HR, Behavioral, Mixed
    questionCount: int = 10  # 5, 10, 15
    interviewerId: str = "alexa"
    resumeText: Optional[str] = None
    candidateName: Optional[str] = "Candidate"

class CandidateAnswerRequest(BaseModel):
    answerText: str
    timeTakenSeconds: Optional[float] = None

class NextQuestionResponse(BaseModel):
    question: str
    questionIndex: int
    totalQuestions: int
    isFollowUp: bool
    isComplete: bool
    interviewerState: str = "SPEAKING"
    interviewerComment: Optional[str] = None

class InterviewSession(BaseModel):
    sessionId: str
    candidateName: str = "Candidate"
    role: str
    experience: str
    interviewType: str
    questionCount: int
    currentQuestionIndex: int = 0
    interviewer: InterviewerConfig
    resumeContext: Optional[str] = None
    conversationHistory: List[Turn] = []
    status: str = "setup"  # setup, lobby, in_progress, completed
    startedAt: float = Field(default_factory=time.time)
    endedAt: Optional[float] = None
    interviewerState: str = "IDLE"  # IDLE, SPEAKING, LISTENING, THINKING, FOLLOW_UP, COMPLETED
