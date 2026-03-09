import json
import logging
import os
from typing import Dict, List, Tuple
from urllib import error, request

LOGGER = logging.getLogger(__name__)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5"


def _fallback_points(skill: str) -> List[str]:
    cap_skill = skill.title()
    return [
        (
            f"Implemented {cap_skill} in my latest project to improve reliability\
              and delivery speed."
        ),
        (
            "Collaborated with cross-functional teams to "
            f"operationalize {cap_skill} standards across releases."
        ),
        (
            f"Applied {cap_skill} in production workflows "
            "with measurable quality and performance gains."
        ),
    ]


def _fallback_placements(skill: str) -> List[str]:
    return [
        f"Experience section under your latest role: add a bullet aligned to {skill}.",
        "Skills summary + one supporting bullet in Experience for proof of impact.",
    ]


def _fallback_suggestions(
    missing_skills: List[str],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    points: Dict[str, List[str]] = {}
    placements: Dict[str, List[str]] = {}
    for skill in missing_skills:
        points[skill] = _fallback_points(skill)
        placements[skill] = _fallback_placements(skill)
    return points, placements


def _build_prompt(
    missing_skills: List[str],
    resume_text: str,
    job_description: str,
) -> str:
    return f"""
You are an expert resume optimization assistant.

Your task is to generate resume-ready supporting bullet points for missing skills
by analyzing both the resume and the job description.

Rules:

1. First infer the TWO most recent projects or roles from the resume using company names,
   project names, and dates/years.
2. For EACH missing skill, generate resume-ready bullet points SEPARATELY for each of
   the two most recent projects.
3. Generate 2–3 concise bullet points per project (total 4–6 per skill).
4. Bullet points must be grounded in the responsibilities, technologies, and context
   mentioned in the resume.
5. Do NOT invent tools, technologies, metrics, or achievements not implied in the resume
   or job description.
6. Each bullet should sound like a real resume accomplishment or responsibility.
7. Avoid generic phrases such as "Worked on" or "Responsible for".
8. Also provide two placement suggestions per skill explaining where the bullets
   should be inserted in the resume.
9. Return valid JSON only. Do not include markdown or explanations.

JSON schema:

{{
  "supporting_points": {{
    "<skill>": {{
      "recent_project_1": ["...", "...", "..."],
      "recent_project_2": ["...", "...", "..."]
    }}
  }},
  "placement_suggestions": {{
    "<skill>": ["...", "..."]
  }}
}}

Missing skills:
{json.dumps(missing_skills)}

Resume (full extracted text):
{resume_text}

Job description (truncated):
{job_description[:7000]}
""".strip()


def _extract_json_object(raw_text: str) -> Dict[str, object]:
    start = raw_text.find("{")
    end = raw_text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model response")
    return json.loads(raw_text[start : end + 1])


def _normalize_results(
    missing_skills: List[str],
    model_payload: Dict[str, object],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    raw_points = model_payload.get("supporting_points", {})
    raw_placements = model_payload.get("placement_suggestions", {})

    points: Dict[str, List[str]] = {}
    placements: Dict[str, List[str]] = {}

    for skill in missing_skills:
        skill_points = raw_points.get(skill) if isinstance(raw_points, dict) else None
        skill_placements = raw_placements.get(skill) if isinstance(raw_placements, dict) else None

        normalized_points = [
            str(item).strip() for item in (skill_points or []) if str(item).strip()
        ]
        normalized_placements = [
            str(item).strip() for item in (skill_placements or []) if str(item).strip()
        ]

        if len(normalized_points) < 3:
            normalized_points = _fallback_points(skill)
        else:
            normalized_points = normalized_points[:3]

        if len(normalized_placements) < 2:
            normalized_placements = _fallback_placements(skill)
        else:
            normalized_placements = normalized_placements[:2]

        points[skill] = normalized_points
        placements[skill] = normalized_placements

    return points, placements


def _call_anthropic(
    api_key: str,
    missing_skills: List[str],
    resume_text: str,
    job_description: str,
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    model = os.getenv("ANTHROPIC_MODEL", DEFAULT_ANTHROPIC_MODEL)
    prompt = _build_prompt(
        missing_skills=missing_skills,
        resume_text=resume_text,
        job_description=job_description,
    )

    payload = {
        "model": model,
        "max_tokens": 1200,
        "temperature": 0.2,
        "messages": [{"role": "user", "content": prompt}],
    }

    req = request.Request(
        ANTHROPIC_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "x-api-key": api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=25) as response:
        response_data = json.loads(response.read().decode("utf-8"))

    content = response_data.get("content", [])
    text_chunks = []
    for chunk in content:
        if isinstance(chunk, dict) and chunk.get("type") == "text":
            text_chunks.append(chunk.get("text", ""))
    raw_text = "\n".join(text_chunks).strip()
    model_payload = _extract_json_object(raw_text)
    return _normalize_results(missing_skills, model_payload)


def build_supporting_content(
    missing_skills: List[str],
    resume_text: str,
    job_description: str,
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    if not missing_skills:
        return {}, {}

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        LOGGER.info("ANTHROPIC_API_KEY not set; using deterministic fallback suggestions")
        return _fallback_suggestions(missing_skills)

    try:
        LOGGER.info("Generating suggestions using Anthropic model")
        return _call_anthropic(
            api_key=api_key,
            missing_skills=missing_skills,
            resume_text=resume_text,
            job_description=job_description,
        )
    except (ValueError, KeyError, json.JSONDecodeError, error.URLError, TimeoutError) as exc:
        LOGGER.warning("Anthropic suggestion generation failed, using fallback. error=%s", exc)
        return _fallback_suggestions(missing_skills)
