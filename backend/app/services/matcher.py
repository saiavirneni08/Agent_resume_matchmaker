import logging
from functools import lru_cache
from typing import Dict, List

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

LOGGER = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer("all-MiniLM-L6-v2")


def compute_match(resume_skills: List[str], jd_skills: List[str]) -> Dict[str, object]:
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    matched = sorted(resume_set.intersection(jd_set))
    missing = sorted(jd_set.difference(resume_set))

    if not jd_skills:
        return {
            "match_score": 0.0,
            "matched_skills": matched,
            "missing_skills": missing,
        }

    model = get_model()

    resume_vector = model.encode([" ".join(sorted(resume_set)) or ""], normalize_embeddings=True)
    jd_vector = model.encode([" ".join(sorted(jd_set)) or ""], normalize_embeddings=True)

    similarity = float(cosine_similarity(resume_vector, jd_vector)[0][0])
    coverage = len(matched) / len(jd_set)

    score = max(0.0, min(100.0, ((similarity * 0.6) + (coverage * 0.4)) * 100))
    score = round(score, 2)

    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
    }
