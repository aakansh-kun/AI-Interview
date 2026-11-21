import uuid
import time
import json
import os
from typing import Dict, Optional, Tuple
from models.interview import (
    InterviewSession,
    CreateInterviewRequest,
    CandidateAnswerRequest,
    NextQuestionResponse,
    Turn
)
from models.evaluation import FinalEvaluation
from prompts.interviewer import get_interviewer_by_id
from services.gemini_service import GeminiService

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

class InterviewEngine:
    def __init__(self, gemini_service: GeminiService):
        self.gemini = gemini_service
        self.sessions: Dict[str, InterviewSession] = {}
        self.evaluations: Dict[str, FinalEvaluation] = {}
        self._load_local_storage()

    def _load_local_storage(self):
        if os.path.exists(SESSIONS_FILE):
            try:
                with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for s_id, s_data in data.items():
                        self.sessions[s_id] = InterviewSession(**s_data)
            except Exception as e:
                print(f"[InterviewEngine] Could not load saved sessions: {e}")

    def _persist_local_storage(self):
        try:
            with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
                data = {s_id: s.model_dump() for s_id, s in self.sessions.items()}
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[InterviewEngine] Could not persist sessions: {e}")

    def create_session(self, req: CreateInterviewRequest) -> Tuple[InterviewSession, str]:
        session_id = str(uuid.uuid4())[:8]
        interviewer = get_interviewer_by_id(req.interviewerId)

        session = InterviewSession(
            sessionId=session_id,
            candidateName=req.candidateName or "Candidate",
            role=req.role,
            experience=req.experience,
            interviewType=req.interviewType,
            questionCount=req.questionCount,
            currentQuestionIndex=0,
            interviewer=interviewer,
            resumeContext=req.resumeText,
            conversationHistory=[],
            status="in_progress",
            startedAt=time.time(),
            interviewerState="SPEAKING"
        )

        # Generate opening question dynamically
        first_q, greeting = self.gemini.generate_first_question(
            role=req.role,
            experience=req.experience,
            interview_type=req.interviewType,
            interviewer=interviewer,
            resume_context=req.resumeText
        )

        full_interviewer_opening = f"{greeting} {first_q}".strip() if greeting else first_q

        session.conversationHistory.append(Turn(
            role="interviewer",
            content=full_interviewer_opening,
            timestamp=time.time(),
            isFollowUp=False,
            questionIndex=1
        ))

        self.sessions[session_id] = session
        self._persist_local_storage()
        return session, full_interviewer_opening

    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        return self.sessions.get(session_id)

    def submit_answer(self, session_id: str, req: CandidateAnswerRequest) -> NextQuestionResponse:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found.")

        # Record candidate answer turn
        session.conversationHistory.append(Turn(
            role="candidate",
            content=req.answerText.strip(),
            timestamp=time.time(),
            durationSeconds=req.timeTakenSeconds
        ))

        session.currentQuestionIndex += 1

        # Check if interview question limit has been reached
        if session.currentQuestionIndex >= session.questionCount:
            session.status = "completed"
            session.endedAt = time.time()
            session.interviewerState = "COMPLETED"

            # Trigger final evaluation
            eval_report = self.gemini.evaluate_interview(session)
            self.evaluations[session_id] = eval_report
            self._persist_local_storage()

            return NextQuestionResponse(
                question="The interview is now complete! Thank you for your time and thoughtful responses.",
                questionIndex=session.currentQuestionIndex,
                totalQuestions=session.questionCount,
                isFollowUp=False,
                isComplete=True,
                interviewerState="COMPLETED",
                interviewerComment="Thank you! Let's examine your results."
            )

        # Still in progress - Interviewer enters THINKING, then generates next question
        session.interviewerState = "THINKING"
        next_q, is_followup, reaction = self.gemini.generate_next_question(
            session=session,
            candidate_answer=req.answerText
        )

        # Record next question turn
        session.conversationHistory.append(Turn(
            role="interviewer",
            content=next_q,
            timestamp=time.time(),
            isFollowUp=is_followup,
            questionIndex=session.currentQuestionIndex + 1
        ))

        session.interviewerState = "SPEAKING"
        self._persist_local_storage()

        return NextQuestionResponse(
            question=next_q,
            questionIndex=session.currentQuestionIndex + 1,
            totalQuestions=session.questionCount,
            isFollowUp=is_followup,
            isComplete=False,
            interviewerState="SPEAKING",
            interviewerComment=reaction
        )

    def complete_interview_early(self, session_id: str) -> FinalEvaluation:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found.")

        session.status = "completed"
        session.endedAt = time.time()
        session.interviewerState = "COMPLETED"

        eval_report = self.gemini.evaluate_interview(session)
        self.evaluations[session_id] = eval_report
        self._persist_local_storage()
        return eval_report

    def get_evaluation(self, session_id: str) -> Optional[FinalEvaluation]:
        if session_id in self.evaluations:
            return self.evaluations[session_id]
        
        session = self.get_session(session_id)
        if session and session.conversationHistory:
            eval_report = self.gemini.evaluate_interview(session)
            self.evaluations[session_id] = eval_report
            return eval_report
        return None
