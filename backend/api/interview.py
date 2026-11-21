from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from models.interview import (
    CreateInterviewRequest,
    CandidateAnswerRequest,
    NextQuestionResponse,
    InterviewSession,
    InterviewerConfig
)
from models.evaluation import FinalEvaluation
from prompts.interviewer import INTERVIEWERS

router = APIRouter(prefix="/interview", tags=["Interview"])

def get_service():
    from main import interview_service
    return interview_service

@router.get("/interviewers", response_model=List[InterviewerConfig])
def list_interviewers():
    return list(INTERVIEWERS.values())

@router.post("/create")
def create_interview(req: CreateInterviewRequest, service = Depends(get_service)):
    try:
        session, opening_turn = service.create_session(req)
        return {
            "sessionId": session.sessionId,
            "session": session,
            "openingQuestion": opening_turn,
            "interviewer": session.interviewer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create interview session: {str(e)}")

@router.get("/{session_id}")
def get_interview(session_id: str, service = Depends(get_service)):
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session

@router.post("/{session_id}/answer", response_model=NextQuestionResponse)
def submit_answer(session_id: str, req: CandidateAnswerRequest, service = Depends(get_service)):
    try:
        response = service.submit_answer(session_id, req)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating next interview question: {str(e)}")

@router.post("/{session_id}/complete", response_model=FinalEvaluation)
def complete_interview(session_id: str, service = Depends(get_service)):
    try:
        evaluation = service.complete_interview_early(session_id)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate interview: {str(e)}")

@router.get("/{session_id}/evaluation", response_model=FinalEvaluation)
def get_evaluation(session_id: str, service = Depends(get_service)):
    evaluation = service.get_evaluation(session_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found for this interview session")
    return evaluation
