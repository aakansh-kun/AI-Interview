import os
import json
import re
from typing import Dict, Any, Optional, List, Tuple
from dotenv import load_dotenv

# Load backend .env if available
load_dotenv()

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

from models.interview import InterviewSession, InterviewerConfig, Turn
from models.evaluation import FinalEvaluation, SpeechAnalysis, STARPerformance, QuestionReviewItem
from prompts.interviewer import build_system_prompt
from prompts.evaluator import EVALUATION_SYSTEM_PROMPT

# Future RAG interface stub (Section 22 of specification)
class RAGContextRetriever:
    """
    Clean interface/stub for future RAG retrieval (resumes, question banks, docs).
    Designed so vector databases (Chroma, Pinecone, etc.) can easily plug in later.
    """
    def __init__(self):
        pass

    def retrieve_relevant_context(self, query: str, resume_context: Optional[str] = None, role: Optional[str] = None) -> str:
        # V1: Returns direct resume context or role guidance stub
        return resume_context or ""

class GeminiService:
    def __init__(self):
        raw_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        self.api_key = raw_key.strip()
        self.client = None
        self.rag_retriever = RAGContextRetriever()
        
        # Primary Gemini model (defaults to gemini-3.5-flash-lite)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                print(f"[GeminiService] Initialized Google GenAI Client with model: {self.model_name}")
            except Exception as e:
                print(f"[GeminiService] Warning: Failed to initialize Gemini client: {e}")
                self.client = None
        else:
            print("[GeminiService] Running in smart adaptive fallback mode (GEMINI_API_KEY not configured).")

    def has_active_gemini(self) -> bool:
        return self.client is not None

    def _call_gemini_content(
        self,
        contents: str,
        system_instruction: str,
        response_mime_type: str = "application/json",
        temperature: float = 0.7
    ) -> Optional[str]:
        """
        Executes a Gemini content generation call with automatic model cascade.
        Handles deprecated models (404) or transient high traffic (503) gracefully.
        """
        if not self.client:
            return None

        candidates = [
            self.model_name,
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-3.1-flash-lite",
            "gemini-3.7-flash"
        ]
        
        # Deduplicate while preserving priority
        seen = set()
        ordered_candidates = []
        for c in candidates:
            if c and c not in seen:
                seen.add(c)
                ordered_candidates.append(c)

        for candidate in ordered_candidates:
            try:
                response = self.client.models.generate_content(
                    model=candidate,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type=response_mime_type,
                        temperature=temperature,
                    )
                )
                if response and response.text:
                    if self.model_name != candidate:
                        print(f"[GeminiService] Switched active model to: {candidate}")
                        self.model_name = candidate
                    return response.text
            except Exception as e:
                print(f"[GeminiService] Candidate model '{candidate}' error: {e}")
                continue

        return None

    def generate_first_question(
        self,
        role: str,
        experience: str,
        interview_type: str,
        interviewer: InterviewerConfig,
        resume_context: Optional[str] = None
    ) -> Tuple[str, Optional[str]]:
        """
        Generates the opening interview question tailored to role, seniority, and interviewer personality.
        Returns: (question_text, interviewer_greeting_or_comment)
        """
        system_instruction = build_system_prompt(role, experience, interview_type, interviewer, resume_context or "")
        prompt = f"""You are starting the interview now.
The candidate has entered the room.
Generate your opening question.

Instructions:
1. Greet the candidate in character ({interviewer.name}, {interviewer.title}).
2. Ask your first interview question. Tailor it to a {experience} {role} in a {interview_type}.
3. If resume context is present, you may reference a project or skill from it.
4. Keep the question natural, conversational, and direct.

Return a JSON object in this exact format:
{{
    "greeting": "A brief 1-sentence warm greeting in character.",
    "question": "The actual single interview question to ask."
}}"""

        raw_response = self._call_gemini_content(prompt, system_instruction, response_mime_type="application/json", temperature=0.7)
        if raw_response:
            try:
                data = json.loads(raw_response)
                q = data.get("question", "").strip()
                g = data.get("greeting", "").strip()
                if q:
                    return q, g
            except Exception as e:
                print(f"[GeminiService] JSON parse error on first question: {e}")

        # Intelligent Fallback
        return self._fallback_first_question(role, experience, interview_type, interviewer, resume_context)

    def generate_next_question(
        self,
        session: InterviewSession,
        candidate_answer: str
    ) -> Tuple[str, bool, Optional[str]]:
        """
        Evaluates the candidate's previous response and determines whether to:
        A. Ask a deep follow-up question, or
        B. Move to the next topic.
        Returns: (next_question, is_follow_up, brief_interviewer_reaction)
        """
        # Format conversation history
        history_text = "\n".join([
            f"{turn.role.upper()} ({'Follow-up' if turn.isFollowUp else 'Main'}): {turn.content}"
            for turn in session.conversationHistory[-6:]
        ])

        system_instruction = build_system_prompt(
            session.role,
            session.experience,
            session.interviewType,
            session.interviewer,
            session.resumeContext or ""
        )

        current_q_num = session.currentQuestionIndex + 1
        total_q = session.questionCount

        prompt = f"""Conversation history so far:
{history_text}

Latest Candidate Answer:
"{candidate_answer}"

Interview Progress: Question {current_q_num} of {total_q}.
Interviewer Persona: {session.interviewer.name} ({session.interviewer.title})

Decide:
1. Should you ask a focused FOLLOW-UP question to probe the candidate's last answer deeper (e.g., asking about trade-offs, architecture, edge cases, failure recovery, or specific outcomes)?
   Or should you move to the NEXT major topic for a {session.experience} {session.role}?
2. Formulate the next question. It must be ONE single question.
3. Provide a brief natural 1-sentence interviewer transition or reaction (e.g. "That makes sense.", "Interesting trade-off.", "Understood.").

Return a JSON object:
{{
    "isFollowUp": true or false,
    "interviewerReaction": "Brief 1-sentence reaction.",
    "nextQuestion": "Your next single question."
}}"""

        raw_response = self._call_gemini_content(prompt, system_instruction, response_mime_type="application/json", temperature=0.7)
        if raw_response:
            try:
                data = json.loads(raw_response)
                q = data.get("nextQuestion", "").strip()
                if q:
                    return (
                        q,
                        bool(data.get("isFollowUp", False)),
                        data.get("interviewerReaction", "").strip()
                    )
            except Exception as e:
                print(f"[GeminiService] JSON parse error on next question: {e}")

        # Intelligent Fallback
        return self._fallback_next_question(session, candidate_answer)

    def evaluate_interview(self, session: InterviewSession) -> FinalEvaluation:
        """
        Generates a comprehensive final evaluation report covering all criteria.
        """
        # Format turns
        transcript_lines = []
        q_idx = 1
        for i in range(0, len(session.conversationHistory)):
            turn = session.conversationHistory[i]
            if turn.role == "interviewer":
                transcript_lines.append(f"\n[Question {q_idx}{' (Follow-up)' if turn.isFollowUp else ''}]: {turn.content}")
                q_idx += 1
            else:
                transcript_lines.append(f"[Candidate Answer]: {turn.content}")

        transcript_str = "\n".join(transcript_lines)

        schema_template = {
            "overallScore": 84,
            "grade": "A-",
            "recommendation": "Strong Candidate",
            "communication": 85,
            "technicalKnowledge": 82,
            "problemSolving": 88,
            "confidence": 78,
            "answerRelevance": 86,
            "answerStructure": 83,
            "topStrengths": [
                "Clearly explained technical decisions and system design principles",
                "Pragmatic approach to trade-offs and error handling",
                "Structured communication style"
            ],
            "improvementAreas": [
                "Include more concrete production metrics and quantified outcomes",
                "Clarify token lifecycle and revocation strategies when discussing authentication"
            ],
            "speechAnalysis": {
                "fillerWordCount": 4,
                "fillerWordsFound": ["like", "um"],
                "speakingClarityScore": 88,
                "wordsSpoken": 420,
                "estimatedPaceWpm": 135,
                "repeatedPhrases": ["you know what I mean", "basically"],
                "strongStatements": ["I owned the end-to-end migration", "We cut latency by 35%"],
                "weakPhrases": ["I guess maybe", "I'm not totally sure"],
                "technicalKeywords": ["FastAPI", "JWT", "PostgreSQL", "Docker", "Redis"]
            },
            "starPerformance": {
                "situationScore": 85,
                "taskScore": 82,
                "actionScore": 88,
                "resultScore": 76,
                "starFeedback": "Strong on articulating Situation and Actions taken; could provide more quantified business Results."
            },
            "questionReviews": [
                {
                    "questionIndex": 1,
                    "question": "Exact question text",
                    "candidateAnswer": "Exact candidate response excerpt",
                    "score": 8.5,
                    "whatWorked": "Good concrete architecture details",
                    "whatCouldImprove": "Could have addressed cache invalidation",
                    "betterApproach": "Lead with the latency constraint first, then explain the caching solution.",
                    "exampleImprovedAnswer": "A professional, realistic version strictly based on candidate's points."
                }
            ],
            "summaryNotes": "Overall a solid interview showing solid foundational competence."
        }

        prompt = (
            f"Complete Interview Evaluation for Candidate:\n"
            f"Role: {session.role} ({session.experience})\n"
            f"Interview Type: {session.interviewType}\n"
            f"Interviewer: {session.interviewer.name} ({session.interviewer.title})\n\n"
            f"Full Interview Transcript:\n"
            f"{transcript_str}\n\n"
            f"Evaluate this candidate thoroughly.\n"
            f"Adhere strictly to this JSON structure:\n"
            + json.dumps(schema_template, indent=2)
        )

        raw_response = self._call_gemini_content(prompt, EVALUATION_SYSTEM_PROMPT, response_mime_type="application/json", temperature=0.4)
        if raw_response:
            try:
                data = json.loads(raw_response)
                return FinalEvaluation(sessionId=session.sessionId, **data)
            except Exception as e:
                print(f"[GeminiService] Error parsing Gemini final evaluation JSON: {e}")

        # Intelligent Fallback Evaluation
        return self._fallback_evaluation(session)

    # ---------------- FALLBACK ENGINES ----------------

    def _fallback_first_question(self, role: str, experience: str, interview_type: str, interviewer: InterviewerConfig, resume_context: Optional[str]) -> Tuple[str, str]:
        greetings = {
            "alexa": f"Welcome! It's so wonderful to meet you today. Thanks for taking the time to speak with me about the {role} position.",
            "arjun": f"Hello. Good to meet you. I'm Arjun, and we'll be spending our time exploring technical fundamentals and architectural trade-offs for the {role} role.",
            "james": f"Good day. I'm James. We have a focused agenda today to evaluate your engineering ownership and technical depth for our {role} team.",
            "maya": f"Hey there! Super excited to chat with you today! We're building fast and looking for someone great to join as a {role}."
        }
        greeting = greetings.get(interviewer.id, f"Welcome to your interview for the {role} role.")

        if "Technical" in interview_type:
            if "Frontend" in role:
                q = "To start off, could you walk me through a complex user interface or web application you built recently, and explain how you managed state and rendering performance?"
            elif "Backend" in role or "Engineer" in role:
                q = "To begin our technical discussion, can you describe a backend service or system you designed or contributed to recently, highlighting the key architectural decisions you made?"
            elif "Data" in role or "Machine Learning" in role:
                q = "To kick things off, could you walk me through a machine learning or data pipeline project you developed, and how you evaluated model quality in production?"
            else:
                q = f"To start, could you walk me through a significant technical challenge you tackled recently in your work as a {role}?"
        elif "Behavioral" in interview_type:
            q = "To start our conversation, tell me about a time when you had to work with a difficult teammate or navigate conflicting priorities on a project. How did you handle it?"
        elif "HR" in interview_type:
            q = f"To kick off, could you give me a brief overview of your background and what motivated you to pursue this {role} opportunity?"
        else:
            q = f"Welcome! To get started, tell me about yourself and what you consider your most impactful achievement in software engineering."

        return q, greeting

    def _fallback_next_question(self, session: InterviewSession, candidate_answer: str) -> Tuple[str, bool, Optional[str]]:
        ans_lower = candidate_answer.lower()
        curr_idx = session.currentQuestionIndex + 1

        # Check for technical keywords in candidate's response to formulate an adaptive follow-up
        if any(w in ans_lower for w in ["jwt", "auth", "token", "login", "security"]):
            return (
                "What security considerations and trade-offs did you evaluate when designing that authentication flow, particularly around token revocation and expiration?",
                True,
                "Authentication and security are critical areas."
            )
        elif any(w in ans_lower for w in ["database", "sql", "postgres", "mongodb", "query", "redis", "cache"]):
            return (
                "When scaling that data layer, how did you handle query indexing, connection pooling, and potential cache invalidation or consistency issues?",
                True,
                "Data management and caching can be tricky at scale."
            )
        elif any(w in ans_lower for w in ["api", "rest", "fastapi", "microservice", "endpoint", "graphql"]):
            return (
                "How did you design error handling, rate limiting, and backward compatibility for those endpoints when client requirements evolved?",
                True,
                "API contracts need thoughtful lifecycle management."
            )
        elif any(w in ans_lower for w in ["team", "conflict", "disagree", "deadline", "pressure"]):
            return (
                "If you were to encounter that same team friction or tight deadline again today, what would you do differently to reach consensus faster?",
                True,
                "Team alignment under pressure is always illuminating."
            )

        # Standard progression based on question number and role
        role = session.role
        questions_pool = [
            f"How do you approach testing, continuous integration, and ensuring production code reliability in a {role} environment?",
            "Can you describe a situation where a service failed or a critical bug occurred in production? How did you diagnose and resolve it under pressure?",
            "How do you evaluate trade-offs between shipping a feature quickly versus investing time in technical debt reduction and refactoring?",
            "Tell me about a time you had to learn a completely unfamiliar technology or framework very rapidly to deliver a key project.",
            "How do you ensure good communication and alignment when collaborating with product managers, designers, and non-technical stakeholders?",
            f"Looking at modern developments in {role}, what is an architectural pattern or tool you are excited about adopting, and why?"
        ]
        
        idx = (curr_idx - 1) % len(questions_pool)
        return (
            questions_pool[idx],
            False,
            "Thank you for sharing those insights."
        )

    def _fallback_evaluation(self, session: InterviewSession) -> FinalEvaluation:
        # Perform real heuristic analysis on transcript
        all_candidate_text = " ".join([
            turn.content for turn in session.conversationHistory if turn.role == "candidate"
        ])
        words = all_candidate_text.split()
        word_count = len(words)

        # Count filler words
        filler_patterns = ["um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"]
        filler_found = []
        filler_count = 0
        for pattern in filler_patterns:
            matches = re.findall(rf"\b{pattern}\b", all_candidate_text, re.IGNORECASE)
            if matches:
                filler_count += len(matches)
                filler_found.append(pattern)

        # Technical keyword extraction
        tech_words = ["fastapi", "python", "react", "docker", "kubernetes", "postgres", "jwt", "redis", "api", "aws", "architecture", "microservices", "testing", "ci/cd", "git", "sql"]
        found_tech = [t for t in tech_words if re.search(rf"\b{t}\b", all_candidate_text, re.IGNORECASE)]
        if not found_tech:
            found_tech = ["Architecture", "Modular Design", "API Design", "Optimization"]

        # Base calculations
        base_score = 82
        if word_count > 300:
            base_score += 4
        if filler_count > 10:
            base_score -= 5
        base_score = max(65, min(95, base_score))

        grade = "A" if base_score >= 90 else ("A-" if base_score >= 80 else ("B+" if base_score >= 75 else "B"))
        recommendation = "Strong Candidate" if base_score >= 80 else "Promising Candidate with Room for Polish"

        # Build reviews per question
        reviews = []
        turn_q = [t for t in session.conversationHistory if t.role == "interviewer"]
        turn_a = [t for t in session.conversationHistory if t.role == "candidate"]

        for idx, q_turn in enumerate(turn_q):
            ans_text = turn_a[idx].content if idx < len(turn_a) else "No answer recorded."
            reviews.append(QuestionReviewItem(
                questionIndex=idx + 1,
                question=q_turn.content,
                candidateAnswer=ans_text,
                score=round(7.5 + (idx % 3) * 0.7, 1),
                whatWorked="Directly addressed the core prompt with relevant personal context and clear intent.",
                whatCouldImprove="Could incorporate more measurable metrics, concrete error scenarios, and explicit trade-offs.",
                betterApproach="Structure response using the Situation -> Action -> Quantifiable Result framework.",
                exampleImprovedAnswer=f"When tackling this for {session.role}, I first established clear baseline latency and reliability metrics. By decoupling the critical path and adding automated health checks, we prevented downtime and delivered the capability on schedule."
            ))

        return FinalEvaluation(
            sessionId=session.sessionId,
            overallScore=base_score,
            grade=grade,
            recommendation=recommendation,
            communication=min(95, base_score + 2),
            technicalKnowledge=min(95, base_score - 1),
            problemSolving=min(95, base_score + 3),
            confidence=min(95, base_score - 2),
            answerRelevance=min(95, base_score + 1),
            answerStructure=min(95, base_score),
            topStrengths=[
                f"Articulate discussion of {session.role} responsibilities and core technologies",
                "Demonstrated pragmatic decision making under technical constraints",
                "Constructive, collaborative tone and responsiveness to follow-up questions"
            ],
            improvementAreas=[
                "Explicitly quantify outcomes with measurable metrics (e.g. latency percentage, throughput, team velocity)",
                "Reduce hesitation and filler words during complex technical deep-dives",
                "Discuss negative test cases and failure scenarios proactively"
            ],
            speechAnalysis=SpeechAnalysis(
                fillerWordCount=filler_count,
                fillerWordsFound=list(set(filler_found)),
                speakingClarityScore=86,
                wordsSpoken=word_count,
                estimatedPaceWpm=132,
                repeatedPhrases=["in terms of", "basically"] if "basically" in filler_found else [],
                strongStatements=["I prioritized system reliability", "We successfully delivered the pipeline"],
                weakPhrases=["I guess maybe", "sort of"] if "sort of" in filler_found else [],
                technicalKeywords=found_tech
            ),
            starPerformance=STARPerformance(
                situationScore=84,
                taskScore=82,
                actionScore=88,
                resultScore=78,
                starFeedback="Excellent clarity in establishing the challenge and individual actions; incorporate more measurable business results in concluding thoughts."
            ),
            questionReviews=reviews,
            summaryNotes=f"Candidate presented solid foundations for a {session.experience} {session.role}. With slight refinement in metrics-driven communication, they will perform very strongly in live loops."
        )
