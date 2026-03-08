import logging
import json as jsonlib
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .models import AnalyzeResponse
from .services.jd_parser import parse_job_description
from .services.matcher import compute_match
from .services.resume_parser import (
    extract_skills,
    extract_text_from_pdf,
)
from .services.suggestions import build_supporting_content

LOGGER = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    LOGGER.info("/analyze called. filename=%s", resume.filename)

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="No readable text found in resume PDF")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    resume_skills = extract_skills(resume_text)
    jd_skills = parse_job_description(job_description)
    match_result = compute_match(resume_skills, jd_skills)

    response = AnalyzeResponse(
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        supporting_points={},
        placement_suggestions={},
    )
    LOGGER.info("Returning response with score=%s", response.match_score)
    return response


@router.post("/suggest", response_model=AnalyzeResponse)
async def suggest_points(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    missing_skills: str = Form(default=""),
):
    LOGGER.info("/suggest called. filename=%s", resume.filename)

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="No readable text found in resume PDF")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    resume_skills = extract_skills(resume_text)
    jd_skills = parse_job_description(job_description)
    match_result = compute_match(resume_skills, jd_skills)
    requested_missing: List[str] = []
    if missing_skills.strip():
        try:
            payload = jsonlib.loads(missing_skills)
            if isinstance(payload, list):
                requested_missing = [str(item).strip() for item in payload if str(item).strip()]
        except jsonlib.JSONDecodeError:
            raise HTTPException(status_code=400, detail="missing_skills must be valid JSON list")

    final_missing = requested_missing or match_result["missing_skills"]
    supporting_points, placement_suggestions = build_supporting_content(
        missing_skills=final_missing,
        resume_text=resume_text,
        job_description=job_description,
    )

    response = AnalyzeResponse(
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=final_missing,
        supporting_points=supporting_points,
        placement_suggestions=placement_suggestions,
    )
    LOGGER.info("Returning suggestion response with score=%s", response.match_score)
    return response
