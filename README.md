# Resume Agent

Resume Agent is a full-stack application that matches uploaded resumes against job descriptions and returns:

- `match_score`
- `matched_skills`
- `missing_skills`
- `supporting_points` for missing skills
- `placement_suggestions` for where to add those points in the resume

## Tech Stack

### Backend
- FastAPI
- Uvicorn
- pdfplumber
- sentence-transformers (`all-MiniLM-L6-v2`)
- scikit-learn

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- react-circular-progressbar

## Project Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── routes.py
│   ├── services/
│   │   ├── resume_parser.py
│   │   ├── jd_parser.py
│   │   ├── matcher.py
│   │   └── suggestions.py
│   └── models.py
├── requirements.txt
├── Dockerfile

frontend/
├── app/
│   ├── page.tsx
│   └── agent/[agentId]/page.tsx
├── components/
│   ├── Header.tsx
│   ├── AgentForm.tsx
│   ├── MatchButton.tsx
│   ├── MatchResult.tsx
│   ├── SkillBadge.tsx
│   ├── Accordion.tsx
│   └── MatchMeter.tsx
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── Dockerfile

root/
├── docker-compose.yml
└── README.md
```

## API

### `POST /analyze`

Request (multipart/form-data):
- `resume`: PDF file
- `job_description`: string

Response:

```json
{
  "match_score": 82.5,
  "matched_skills": ["python", "fastapi"],
  "missing_skills": ["terraform", "snowflake"],
  "supporting_points": {
    "terraform": [
      "• Designed IaC using Terraform...",
      "• Automated Terraform modules...",
      "• Integrated Terraform with CI/CD..."
    ]
  },
  "placement_suggestions": {
    "terraform": [
      "Experience section under your latest role...",
      "Projects section under cloud automation work..."
    ]
  }
}
```

### Claude Suggestions (Optional)

Set `ANTHROPIC_API_KEY` in the backend environment to generate contextual suggestions with Claude.
Optional: set `ANTHROPIC_MODEL` (default: `claude-sonnet-4-5`).
If no API key is configured, the API uses deterministic fallback suggestions.

## Run with Docker

From project root:

```bash
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

## Local Run (Poetry + Just)

Prerequisites:
- Python 3.12
- Poetry
- just

From project root:

```bash
poetry install
just serve
```

Useful commands:

```bash
just install          # install python deps via poetry
just backend          # run FastAPI backend
just frontend-install # install frontend deps
just frontend         # run Next.js frontend
just check            # compile-check backend python files
```

## Quality Gates (Before Merge)

This repo includes CI checks in [ci.yml](/Users/saichowdaryavirneni/resume-agent/.github/workflows/ci.yml):
- Backend lint + format check (`ruff`)
- Frontend lint (`next lint`)
- Text/repo hygiene (`pre-commit` hooks: trailing whitespace, EOF, yaml/json checks, etc.)

Run the same checks locally before pushing:

```bash
poetry install
just precommit-install
just precommit
just lint
```

In GitHub, enable branch protection on `main` and require all CI status checks to pass before merge.

## Notes

- The first analysis call may take longer because the sentence-transformer model is downloaded and loaded.
- Frontend includes warnings for missing resume or job description.
- Supporting points include copy-to-clipboard per missing skill.
