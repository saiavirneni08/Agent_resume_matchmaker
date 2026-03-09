import hashlib
import json as jsonlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from sqlalchemy import and_, desc, select
from sqlalchemy.orm import Session

from .database import get_db
from .db_models import ScanSession, UploadedFile, User, UserSession
from .models import (
    AnalyzeResponse,
    AuthResponse,
    HistoryItemResponse,
    HistoryResponse,
    LoginRequest,
    MeResponse,
    SignupRequest,
)
from .security import create_session_token, get_session_ttl_hours, hash_password, verify_password
from .services.jd_parser import parse_job_description
from .services.matcher import compute_match
from .services.resume_parser import extract_skills, extract_text_from_pdf
from .services.suggestions import build_supporting_content

LOGGER = logging.getLogger(__name__)
router = APIRouter()


def _owner_scope(user: Optional[User]) -> str:
    return f"user:{user.id}" if user else "anon"


def _parse_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    prefix = "bearer "
    if authorization.lower().startswith(prefix):
        token = authorization[len(prefix) :].strip()
        return token or None
    return None


def _get_user_from_token(db: Session, token: Optional[str]) -> Optional[User]:
    if not token:
        return None

    now = datetime.now(timezone.utc)
    session_row = db.scalar(
        select(UserSession).where(
            and_(
                UserSession.session_token == token,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
        )
    )
    if not session_row:
        return None
    return db.get(User, session_row.user_id)


def _require_user(db: Session, authorization: Optional[str]) -> User:
    token = _parse_bearer_token(authorization)
    user = _get_user_from_token(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


def _persist_uploaded_file(
    db: Session,
    user: Optional[User],
    filename: str,
    file_bytes: bytes,
) -> tuple[UploadedFile, bool]:
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    scope = _owner_scope(user)

    existing = db.scalar(
        select(UploadedFile).where(
            and_(UploadedFile.owner_scope == scope, UploadedFile.file_hash == file_hash)
        )
    )
    if existing:
        return existing, True

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="No readable text found in resume PDF")

    uploaded = UploadedFile(
        user_id=user.id if user else None,
        owner_scope=scope,
        original_filename=filename,
        file_hash=file_hash,
        content=file_bytes,
        extracted_text=resume_text,
    )
    db.add(uploaded)
    db.commit()
    db.refresh(uploaded)
    return uploaded, False


def _create_scan_session(
    db: Session,
    user: Optional[User],
    uploaded_file: UploadedFile,
    job_description: str,
    match_score: float,
    matched_skills: list[str],
    missing_skills: list[str],
) -> ScanSession:
    scan = ScanSession(
        user_id=user.id if user else None,
        uploaded_file_id=uploaded_file.id,
        job_description=job_description,
        match_score=match_score,
        matched_skills_json=jsonlib.dumps(matched_skills),
        missing_skills_json=jsonlib.dumps(missing_skills),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


@router.post("/auth/signup", response_model=AuthResponse, status_code=201)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=email,
        full_name=(payload.full_name or "").strip() or None,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    ttl_hours = get_session_ttl_hours()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)
    token = create_session_token()

    db.add(
        UserSession(
            user_id=user.id,
            session_token=token,
            expires_at=expires_at,
        )
    )
    db.commit()

    return AuthResponse(
        token=token,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        expires_at=expires_at.isoformat(),
    )


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    ttl_hours = get_session_ttl_hours()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)
    token = create_session_token()

    db.add(
        UserSession(
            user_id=user.id,
            session_token=token,
            expires_at=expires_at,
        )
    )
    db.commit()

    return AuthResponse(
        token=token,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        expires_at=expires_at.isoformat(),
    )


@router.post("/auth/logout")
def logout(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    token = _parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    row = db.scalar(select(UserSession).where(UserSession.session_token == token))
    if not row or row.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    row.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "ok"}


@router.get("/auth/me", response_model=MeResponse)
def me(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    user = _require_user(db, authorization)
    return MeResponse(user_id=str(user.id), email=user.email, full_name=user.full_name)


@router.get("/history", response_model=HistoryResponse)
def history(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    user = _require_user(db, authorization)
    rows = db.execute(
        select(ScanSession, UploadedFile)
        .join(UploadedFile, ScanSession.uploaded_file_id == UploadedFile.id)
        .where(ScanSession.user_id == user.id)
        .order_by(desc(ScanSession.created_at))
    ).all()

    items = [
        HistoryItemResponse(
            session_id=str(scan.id),
            uploaded_file_id=str(scan.uploaded_file_id),
            original_filename=uploaded.original_filename,
            match_score=scan.match_score,
            matched_skills=jsonlib.loads(scan.matched_skills_json),
            missing_skills=jsonlib.loads(scan.missing_skills_json),
            created_at=scan.created_at.isoformat(),
        )
        for scan, uploaded in rows
    ]
    return HistoryResponse(items=items)


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    token = _parse_bearer_token(authorization)
    user = _get_user_from_token(db, token)
    uploaded_file, already_exists = _persist_uploaded_file(
        db=db,
        user=user,
        filename=resume.filename,
        file_bytes=file_bytes,
    )

    resume_text = uploaded_file.extracted_text
    resume_skills = extract_skills(resume_text)
    jd_skills = parse_job_description(job_description)
    match_result = compute_match(resume_skills, jd_skills)

    scan_session = _create_scan_session(
        db=db,
        user=user,
        uploaded_file=uploaded_file,
        job_description=job_description,
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
    )

    response = AnalyzeResponse(
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        supporting_points={},
        placement_suggestions={},
        session_id=str(scan_session.id),
        uploaded_file_id=str(uploaded_file.id),
        file_already_exists=already_exists,
    )
    return response


@router.post("/suggest", response_model=AnalyzeResponse)
async def suggest_points(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    missing_skills: str = Form(default=""),
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    token = _parse_bearer_token(authorization)
    user = _get_user_from_token(db, token)
    uploaded_file, already_exists = _persist_uploaded_file(
        db=db,
        user=user,
        filename=resume.filename,
        file_bytes=file_bytes,
    )

    resume_text = uploaded_file.extracted_text
    resume_skills = extract_skills(resume_text)
    jd_skills = parse_job_description(job_description)
    match_result = compute_match(resume_skills, jd_skills)

    requested_missing: list[str] = []
    if missing_skills.strip():
        try:
            payload = jsonlib.loads(missing_skills)
            if isinstance(payload, list):
                requested_missing = [str(item).strip() for item in payload if str(item).strip()]
        except jsonlib.JSONDecodeError as exc:
            raise HTTPException(
                status_code=400,
                detail="missing_skills must be valid JSON list",
            ) from exc

    final_missing = requested_missing or match_result["missing_skills"]
    supporting_points, placement_suggestions = build_supporting_content(
        missing_skills=final_missing,
        resume_text=resume_text,
        job_description=job_description,
    )

    scan_session = _create_scan_session(
        db=db,
        user=user,
        uploaded_file=uploaded_file,
        job_description=job_description,
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=final_missing,
    )

    response = AnalyzeResponse(
        match_score=match_result["match_score"],
        matched_skills=match_result["matched_skills"],
        missing_skills=final_missing,
        supporting_points=supporting_points,
        placement_suggestions=placement_suggestions,
        session_id=str(scan_session.id),
        uploaded_file_id=str(uploaded_file.id),
        file_already_exists=already_exists,
    )
    LOGGER.info(
        "Returning suggestion response with score=%s session_id=%s deduped=%s",
        response.match_score,
        response.session_id,
        response.file_already_exists,
    )
    return response
