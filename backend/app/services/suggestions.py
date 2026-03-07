import json
import logging
import os
from typing import Dict, List, Tuple
from urllib import error, request

LOGGER = logging.getLogger(__name__)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_ANTHROPIC_MODEL = "claude-3-5-sonnet-latest"


def _fallback_points(skill: str, recent_projects: List[str]) -> List[str]:
    cap_skill = skill.title()
    project_context = recent_projects[-1] if recent_projects else "my latest project"
    return [
        f"Implemented {cap_skill} in {project_context[:120]} to improve reliability and delivery speed.",
        f"Collaborated with cross-functional teams to operationalize {cap_skill} standards across releases.",
        f"Applied {cap_skill} in production workflows with measurable quality and performance gains.",
    ]


def _fallback_placements(skill: str, recent_projects: List[str]) -> List[str]:
    placements = []
    if recent_projects:
        placements.append(f"Experience section under the most recent project: add one impact bullet mentioning {skill}.")
        placements.append("Projects section: include one implementation bullet and one outcomes bullet.")
    else:
        placements.append(f"Experience section under your latest role: add a bullet aligned to {skill}.")
        placements.append("Skills summary + one supporting bullet in Experience for proof of impact.")
    return placements


def _fallback_suggestions(missing_skills: List[str], recent_projects: List[str]) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    points: Dict[str, List[str]] = {}
    placements: Dict[str, List[str]] = {}
    for skill in missing_skills:
        points[skill] = _fallback_points(skill, recent_projects)
        placements[skill] = _fallback_placements(skill, recent_projects)
    return points, placements


def _build_prompt(missing_skills: List[str], resume_text: str, job_description: str, recent_projects: List[str]) -> str:
    recent_block = "\n".join(f"- {proj}" for proj in recent_projects) if recent_projects else "- Not confidently extracted"
    return f"""
You are a resume optimization assistant.

Generate suggestions for missing skills based on resume and JD context.

Rules:
1) For each missing skill, return exactly 3 concise, resume-ready bullet points.
2) Bullet points must be grounded in the resume context, especially the 2 most recent projects when available.
3) Do not invent hard metrics or tools not implied by the provided text.
4) Also provide 2 placement suggestions per skill describing where to add those bullets in the resume.
5) Return valid JSON only. No markdown.

JSON schema:
{{
  "supporting_points": {{
    "<skill>": ["...", "...", "..."]
  }},
  "placement_suggestions": {{
    "<skill>": ["...", "..."]
  }}
}}

Missing skills:
{json.dumps(missing_skills)}

Most recent two project snippets:
{recent_block}

Resume (full extracted text, truncated):
{resume_text[:12000]}

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
    recent_projects: List[str],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    raw_points = model_payload.get("supporting_points", {})
    raw_placements = model_payload.get("placement_suggestions", {})

    points: Dict[str, List[str]] = {}
    placements: Dict[str, List[str]] = {}

    for skill in missing_skills:
        skill_points = raw_points.get(skill) if isinstance(raw_points, dict) else None
        skill_placements = raw_placements.get(skill) if isinstance(raw_placements, dict) else None

        normalized_points = [str(item).strip() for item in (skill_points or []) if str(item).strip()]
        normalized_placements = [str(item).strip() for item in (skill_placements or []) if str(item).strip()]

        if len(normalized_points) < 3:
            normalized_points = _fallback_points(skill, recent_projects)
        else:
            normalized_points = normalized_points[:3]

        if len(normalized_placements) < 2:
            normalized_placements = _fallback_placements(skill, recent_projects)
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
    recent_projects: List[str],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    model = os.getenv("ANTHROPIC_MODEL", DEFAULT_ANTHROPIC_MODEL)
    prompt = _build_prompt(
        missing_skills=missing_skills,
        resume_text=resume_text,
        job_description=job_description,
        recent_projects=recent_projects,
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
    return _normalize_results(missing_skills, model_payload, recent_projects)


def build_supporting_content(
    missing_skills: List[str],
    resume_text: str,
    job_description: str,
    recent_projects: List[str],
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:
    if not missing_skills:
        return {}, {}

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        LOGGER.info("ANTHROPIC_API_KEY not set; using deterministic fallback suggestions")
        return _fallback_suggestions(missing_skills, recent_projects)

    try:
        LOGGER.info("Generating suggestions using Anthropic model")
        return _call_anthropic(
            api_key=api_key,
            missing_skills=missing_skills,
            resume_text=resume_text,
            job_description=job_description,
            recent_projects=recent_projects,
        )
    except (ValueError, KeyError, json.JSONDecodeError, error.URLError, TimeoutError) as exc:
        LOGGER.warning("Anthropic suggestion generation failed, using fallback. error=%s", exc)
        return _fallback_suggestions(missing_skills, recent_projects)
