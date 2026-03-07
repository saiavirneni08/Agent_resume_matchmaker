import logging
import re
from typing import List

import io
import pdfplumber

LOGGER = logging.getLogger(__name__)

COMMON_SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "fastapi",
    "django",
    "flask",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "snowflake",
    "spark",
    "hadoop",
    "airflow",
    "git",
    "ci/cd",
    "jenkins",
    "github actions",
    "rest api",
    "graphql",
    "linux",
    "pandas",
    "numpy",
    "machine learning",
    "data engineering",
    "etl",
    "microservices",
    "oauth",
    "prompt engineering",
}

ALIASES = {
    "nextjs": "next.js",
    "nodejs": "node.js",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "iac": "terraform",
    "github": "github actions",
    "cicd": "ci/cd",
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    LOGGER.info("Starting PDF text extraction")
    full_text = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            LOGGER.info("Extracted text from page %s", idx)
            full_text.append(text)
    combined = "\n".join(full_text).strip()
    LOGGER.info("Completed PDF extraction. Characters extracted: %s", len(combined))
    return combined


def normalize_text(text: str) -> str:
    clean = text.lower()
    clean = re.sub(r"[^a-z0-9+.#/\-\s]", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def extract_skills(text: str) -> List[str]:
    normalized = normalize_text(text)
    found = set()

    for raw_token in normalized.split():
        mapped = ALIASES.get(raw_token, raw_token)
        if mapped in COMMON_SKILLS:
            found.add(mapped)

    for skill in COMMON_SKILLS:
        if " " in skill or "." in skill or "/" in skill:
            if skill in normalized:
                found.add(skill)

    sorted_skills = sorted(found)
    LOGGER.info("Extracted %s skills", len(sorted_skills))
    return sorted_skills


def extract_recent_project_context(resume_text: str) -> str:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    if not lines:
        return ""

    project_like = [
        line
        for line in lines
        if any(
            marker in line.lower()
            for marker in [
                "project",
                "experience",
                "developed",
                "implemented",
                "built",
                "engineer",
            ]
        )
    ]

    if not project_like:
        return ""

    last_lines = project_like[-3:]
    context = " ".join(last_lines)
    LOGGER.info("Derived recent project context of length %s", len(context))
    return context


def extract_recent_projects(resume_text: str, max_projects: int = 2) -> List[str]:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    if not lines or max_projects <= 0:
        return []

    markers = [
        "project",
        "experience",
        "developed",
        "implemented",
        "built",
        "engineer",
        "launched",
        "designed",
    ]

    candidate_lines = [line for line in lines if any(marker in line.lower() for marker in markers)]
    if not candidate_lines:
        return []

    recent = []
    for line in reversed(candidate_lines):
        if len(line.split()) < 4:
            continue
        recent.append(line[:220])
        if len(recent) >= max_projects:
            break

    projects = list(reversed(recent))
    LOGGER.info("Extracted %s recent project snippets", len(projects))
    return projects
