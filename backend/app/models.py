from typing import Dict, List

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
