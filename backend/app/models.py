from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):
    match_score: float = Field(..., description="Match score as a percentage")
    matched_skills: List[str]
    missing_skills: List[str]
    supporting_points: Dict[str, List[str]]
    placement_suggestions: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Recommended resume sections to place each generated supporting point",
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Persisted scan session identifier",
    )
    uploaded_file_id: Optional[str] = Field(
        default=None,
        description="Stored uploaded file identifier",
    )
    file_already_exists: Optional[bool] = Field(
        default=None,
        description="True when the uploaded file was already stored and reused",
    )


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    email: str
    full_name: Optional[str] = None
    expires_at: str


class MeResponse(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None


class HistoryItemResponse(BaseModel):
    session_id: str
    uploaded_file_id: str
    original_filename: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    created_at: str


class HistoryResponse(BaseModel):
    items: List[HistoryItemResponse]
