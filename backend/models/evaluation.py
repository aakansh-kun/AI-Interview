from typing import List, Optional
from pydantic import BaseModel, Field

class SpeechAnalysis(BaseModel):
    fillerWordCount: int = 0
    fillerWordsFound: List[str] = []
    speakingClarityScore: int = 85
    wordsSpoken: int = 0
    estimatedPaceWpm: int = 130
    repeatedPhrases: List[str] = []
    strongStatements: List[str] = []
    weakPhrases: List[str] = []
    technicalKeywords: List[str] = []

class STARPerformance(BaseModel):
    situationScore: int = 80
    taskScore: int = 80
    actionScore: int = 85
    resultScore: int = 75
    starFeedback: str

class QuestionReviewItem(BaseModel):
    questionIndex: int
    question: str
    candidateAnswer: str
    score: float = Field(ge=0.0, le=10.0)
    whatWorked: str
    whatCouldImprove: str
    betterApproach: str
    exampleImprovedAnswer: str

class FinalEvaluation(BaseModel):
    sessionId: str
    overallScore: int = Field(ge=0, le=100)
    grade: str  # e.g. "A+", "A", "A-", "B+", "B", "C"
    recommendation: str  # e.g. "Strong Hire", "Strong Candidate", "Proceed with Caution", "Needs Preparation"
    communication: int = Field(ge=0, le=100)
    technicalKnowledge: int = Field(ge=0, le=100)
    problemSolving: int = Field(ge=0, le=100)
    confidence: int = Field(ge=0, le=100)
    answerRelevance: int = Field(ge=0, le=100)
    answerStructure: int = Field(ge=0, le=100)
    topStrengths: List[str] = []
    improvementAreas: List[str] = []
    speechAnalysis: SpeechAnalysis
    starPerformance: Optional[STARPerformance] = None
    questionReviews: List[QuestionReviewItem] = []
    summaryNotes: str = ""
