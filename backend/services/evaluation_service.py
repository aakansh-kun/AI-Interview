from typing import Dict, Any, List
from models.interview import InterviewSession
from models.evaluation import FinalEvaluation, SpeechAnalysis, STARPerformance, QuestionReviewItem
from nlp.filler_detection import FillerDetector
from nlp.confidence_analysis import ConfidenceAnalyzer
from nlp.structure_analysis import StructureAnalyzer
from similarity.semantic_similarity import SemanticSimilarityService
from services.gemini_service import GeminiService

class EvaluationService:
    def __init__(self, gemini_service: GeminiService):
        self.gemini = gemini_service

    def generate_evaluation(self, session: InterviewSession) -> FinalEvaluation:
        """
        Orchestrates the evaluation pipeline:
        1. Local NLP deterministic extraction (fillers, confidence, pacing, STAR).
        2. Semantic similarity scoring between answers and expected role competencies.
        3. Gemini LLM contextual synthesis for deep per-question reviews & model answers.
        """
        # Aggregate candidate answers and total timing
        candidate_turns = [t for t in session.conversationHistory if t.role == "candidate"]
        total_candidate_text = " ".join([t.content for t in candidate_turns])
        total_duration = sum([t.durationSeconds or 0.0 for t in candidate_turns])

        # 1. Deterministic NLP Analysis
        filler_count, filler_words, _ = FillerDetector.analyze(total_candidate_text)
        conf_score, strong_stmts, weak_phrases = ConfidenceAnalyzer.analyze(total_candidate_text)
        pacing_data = StructureAnalyzer.analyze_pacing_and_length(total_candidate_text, total_duration)
        star_data = StructureAnalyzer.analyze_star_methodology(total_candidate_text)

        # 2. Semantic Similarity Score
        role_competencies = [
            session.role, "system design", "architecture", "trade-offs",
            "production reliability", "debugging", "scalability", "testing"
        ]
        semantic_relevance = SemanticSimilarityService.evaluate_role_relevance(
            total_candidate_text, role_competencies
        )

        # 3. Gemini LLM Evaluation
        gemini_report = self.gemini.evaluate_interview(session)

        # Merge deterministic NLP and semantic metrics into the final evaluation
        merged_speech = SpeechAnalysis(
            fillerWordCount=filler_count,
            fillerWordsFound=filler_words,
            speakingClarityScore=pacing_data["clarityScore"],
            wordsSpoken=pacing_data["wordCount"],
            estimatedPaceWpm=pacing_data["estimatedPaceWpm"],
            repeatedPhrases=gemini_report.speechAnalysis.repeatedPhrases,
            strongStatements=strong_stmts if strong_stmts else gemini_report.speechAnalysis.strongStatements,
            weakPhrases=weak_phrases if weak_phrases else gemini_report.speechAnalysis.weakPhrases,
            technicalKeywords=gemini_report.speechAnalysis.technicalKeywords
        )

        merged_star = STARPerformance(
            situationScore=star_data["situationScore"],
            taskScore=star_data["taskScore"],
            actionScore=star_data["actionScore"],
            resultScore=star_data["resultScore"],
            starFeedback=star_data["starFeedback"]
        )

        # Confidence and Answer Relevance enriched with deterministic scores
        final_conf = int((conf_score + gemini_report.confidence) / 2)
        final_relevance = int((semantic_relevance + gemini_report.answerRelevance) / 2)

        return FinalEvaluation(
            sessionId=session.sessionId,
            overallScore=gemini_report.overallScore,
            grade=gemini_report.grade,
            recommendation=gemini_report.recommendation,
            communication=gemini_report.communication,
            technicalKnowledge=gemini_report.technicalKnowledge,
            problemSolving=gemini_report.problemSolving,
            confidence=final_conf,
            answerRelevance=final_relevance,
            answerStructure=gemini_report.answerStructure,
            topStrengths=gemini_report.topStrengths,
            improvementAreas=gemini_report.improvementAreas,
            speechAnalysis=merged_speech,
            starPerformance=merged_star,
            questionReviews=gemini_report.questionReviews,
            summaryNotes=gemini_report.summaryNotes
        )
