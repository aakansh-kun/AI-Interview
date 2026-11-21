from fastapi import APIRouter, HTTPException, Depends
from models.evaluation import FinalEvaluation

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

def get_service():
    from main import interview_service
    return interview_service

@router.get("/{session_id}", response_model=FinalEvaluation)
def get_evaluation(session_id: str, service = Depends(get_service)):
    evaluation = service.get_evaluation(session_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation report not found")
    return evaluation
