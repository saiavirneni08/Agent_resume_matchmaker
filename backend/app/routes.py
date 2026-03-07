import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .models import AnalyzeResponse
from .services.jd_parser import parse_job_description
from .services.matcher import compute_match
from .services.resume_parser import (
    extract_recent_projects,
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
    recent_projects = extract_recent_projects(resume_text, max_projects=2)
    supporting_points, placement_suggestions = build_supporting_content(
        missing_skills=match_result["missing_skills"],
        resume_text=resume_text,
        job_description=job_description,
        recent_projects=recent_projects,
    )

    response = AnalyzeResponse(
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        supporting_points=supporting_points,
        placement_suggestions=placement_suggestions,
    )
    LOGGER.info("Returning response with score=%s", response.match_score)
    return response
