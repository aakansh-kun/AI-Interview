import math
import re
from typing import List, Dict

class SemanticSimilarityService:
    """
    Computes semantic similarity and topic relevance between candidate answers
    and target engineering concepts / reference question context.
    Architected to cleanly integrate with vector embedding stores (Chroma, Pinecone) in future RAG phases.
    """

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        # Normalize and filter short words
        words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
        stopwords = {
            "the", "and", "for", "with", "that", "this", "from", "have", "were",
            "been", "what", "which", "will", "would", "about", "there", "their"
        }
        return [w for w in words if w not in stopwords]

    @staticmethod
    def _term_frequency(tokens: List[str]) -> Dict[str, float]:
        tf: Dict[str, float] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0.0) + 1.0
        # Normalize vector length
        norm = math.sqrt(sum(v * v for v in tf.values()))
        if norm > 0:
            for t in tf:
                tf[t] /= norm
        return tf

    @classmethod
    def compute_similarity(cls, text_a: str, text_b: str) -> float:
        """
        Calculates cosine similarity between two text representations (0.0 to 1.0).
        """
        if not text_a or not text_b:
            return 0.0

        vec_a = cls._term_frequency(cls._tokenize(text_a))
        vec_b = cls._term_frequency(cls._tokenize(text_b))

        # Dot product
        common_terms = set(vec_a.keys()) & set(vec_b.keys())
        dot_product = sum(vec_a[t] * vec_b[t] for t in common_terms)

        return round(max(0.0, min(1.0, dot_product)), 3)

    @classmethod
    def evaluate_role_relevance(cls, candidate_answer: str, expected_competencies: List[str]) -> float:
        """
        Calculates alignment between candidate response and target role expectations.
        """
        if not expected_competencies or not candidate_answer:
            return 0.75

        ref_text = " ".join(expected_competencies)
        score = cls.compute_similarity(candidate_answer, ref_text)
        # Scaled to 0-100 percentage
        return round(min(98.0, 60.0 + score * 40.0), 1)
