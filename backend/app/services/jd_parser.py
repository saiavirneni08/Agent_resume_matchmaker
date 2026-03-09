import logging

from .resume_parser import extract_skills

LOGGER = logging.getLogger(__name__)


def parse_job_description(job_description: str):
    LOGGER.info("Parsing job description")
    skills = extract_skills(job_description)
    return skills
