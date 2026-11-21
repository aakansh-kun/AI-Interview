import re
from typing import List, Tuple

ASSERTIVE_PATTERNS = [
    r"\bi (owned|led|architected|designed|built|implemented|migrated|optimized|resolved|decided)\b",
    r"\bwe (reduced|achieved|delivered|increased|scaled|shipped|cut)\b",
    r"\bthe trade-off was\b",
    r"\bthe root cause was\b",
    r"\bi prioritized\b",
    r"\bmy responsibility was\b",
]

HESITANT_PATTERNS = [
    r"\bi guess\b",
    r"\bmaybe\b",
    r"\bsort of\b",
    r"\bkind of\b",
    r"\bi'm not totally sure\b",
    r"\bi didn't really know\b",
    r"\bsomeone else did that\b",
    r"\bprobably\b",
]

class ConfidenceAnalyzer:
    @staticmethod
    def analyze(text: str) -> Tuple[int, List[str], List[str]]:
        """
        Analyzes linguistic assertiveness vs. hesitation markers in candidate speech.
        Returns: (confidence_score_0_to_100, strong_statements, weak_phrases)
        """
        if not text:
            return 70, [], []

        strong_found = []
        weak_found = []

        for pat in ASSERTIVE_PATTERNS:
            matches = re.finditer(pat, text, flags=re.IGNORECASE)
            for m in matches:
                # Capture the surrounding clause
                start = max(0, m.start() - 10)
                end = min(len(text), m.end() + 25)
                strong_found.append(text[start:end].strip())

        for pat in HESITANT_PATTERNS:
            matches = re.finditer(pat, text, flags=re.IGNORECASE)
            for m in matches:
                weak_found.append(m.group().strip())

        # Calculate score deterministically
        base_confidence = 78
        base_confidence += min(16, len(strong_found) * 4)
        base_confidence -= min(20, len(weak_found) * 5)
        score = max(50, min(96, base_confidence))

        return score, strong_found[:4], list(set(weak_found))
