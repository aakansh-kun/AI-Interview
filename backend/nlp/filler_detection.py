import re
from typing import Dict, List, Tuple

FILLER_PATTERNS = [
    r"\bum\b",
    r"\buh\b",
    r"\ber\b",
    r"\bah\b",
    r"\blike\b",
    r"\byou know\b",
    r"\bbasically\b",
    r"\bactually\b",
    r"\bsort of\b",
    r"\bkind of\b",
    r"\bi mean\b",
    r"\bto be honest\b",
]

class FillerDetector:
    @staticmethod
    def analyze(text: str) -> Tuple[int, List[str], Dict[str, int]]:
        """
        Performs deterministic regex-based filler word detection on candidate speech transcript.
        Returns: (total_filler_count, unique_fillers_found, occurrences_by_phrase)
        """
        if not text:
            return 0, [], {}

        total_count = 0
        found_phrases = []
        occurrences: Dict[str, int] = {}

        for pattern in FILLER_PATTERNS:
            clean_name = pattern.replace(r"\b", "").strip()
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            count = len(matches)
            if count > 0:
                total_count += count
                found_phrases.append(clean_name)
                occurrences[clean_name] = count

        return total_count, found_phrases, occurrences
