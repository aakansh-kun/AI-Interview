import re
from typing import Dict, Any, List

class StructureAnalyzer:
    @staticmethod
    def analyze_pacing_and_length(text: str, total_duration_seconds: float = 0.0) -> Dict[str, Any]:
        """
        Calculates word count, estimated WPM pacing, and articulation clarity.
        """
        words = text.split()
        word_count = len(words)

        if total_duration_seconds > 5.0:
            minutes = total_duration_seconds / 60.0
            pace_wpm = int(word_count / minutes)
        else:
            pace_wpm = 130 # Standard benchmark

        # Pacing assessment (optimal interview range: 120 - 155 WPM)
        clarity_score = 88
        if pace_wpm < 90 or pace_wpm > 180:
            clarity_score -= 8
        elif pace_wpm < 110 or pace_wpm > 165:
            clarity_score -= 4

        return {
            "wordCount": word_count,
            "estimatedPaceWpm": pace_wpm,
            "clarityScore": max(60, min(95, clarity_score))
        }

    @staticmethod
    def analyze_star_methodology(text: str) -> Dict[str, Any]:
        """
        Detects Situation, Task, Action, and Result indicators in candidate responses.
        """
        lower = text.lower()

        # Situation
        has_situation = any(w in lower for w in ["context", "situation", "background", "we had", "when I was", "at my previous"])
        # Task
        has_task = any(w in lower for w in ["goal", "challenge", "problem", "needed to", "tasked with", "objective", "requirement"])
        # Action
        has_action = any(w in lower for w in ["i built", "i designed", "i created", "i implemented", "i decided", "we migrated", "i rewrote", "i refactored"])
        # Result
        has_result = any(w in lower for w in ["result", "outcome", "improved", "reduced", "decreased", "increased", "percent", "%", "latency", "revenue", "ms"])

        sit_score = 85 if has_situation else 72
        task_score = 85 if has_task else 74
        action_score = 90 if has_action else 76
        result_score = 88 if has_result else 68

        feedback_parts = []
        if has_action and has_result:
            feedback_parts.append("Strong articulation of technical actions taken and measurable outcomes achieved.")
        elif has_action:
            feedback_parts.append("Clear description of actions taken; consider adding more quantified metrics to the final result.")
        else:
            feedback_parts.append("Structure your responses more firmly around what actions you personally took.")

        return {
            "situationScore": sit_score,
            "taskScore": task_score,
            "actionScore": action_score,
            "resultScore": result_score,
            "starFeedback": " ".join(feedback_parts)
        }
