# Resume Agent

Resume Agent matches uploaded resumes against job descriptions and returns:

- `match_score`
- `matched_skills`
- `missing_skills`
- `supporting_points` for missing skills
- `placement_suggestions` for where to add those points

It now also supports:

- PostgreSQL persistence via SQLAlchemy
- Alembic migrations
- user signup/login/logout (`/auth/*`)
- session-based upload ownership
- uploaded resume deduplication (same file hash for same user scope is reused)
- persisted scan sessions (`scan_sessions`)

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL (`psycopg`)
- pdfplumber
- sentence-transformers (`all-MiniLM-L6-v2`)
- scikit-learn

### Frontend
- Next.js (App Router)
- TypeScript
- TailwindCSS

## Run Locally (Poetry + Just)

Prerequisites:
- Python 3.12
- Poetry
- just
- PostgreSQL (running locally on port 5432)

1. Install dependencies:

```bash
poetry install
```

2. Copy env and set keys:

```bash
cp .env.example .env
```

3. Run DB migrations:

```bash
just db-up
```

4. Run app:

```bash
just serve
```

Backend docs: http://localhost:8000/docs

## Run with Docker

```bash
docker-compose up --build
```

Services:
- Postgres: `localhost:5432`
- Backend: `localhost:8000`
- Frontend: `localhost:3000`

After backend starts, run migrations once:

```bash
poetry run alembic -c backend/alembic.ini upgrade head
```

## DB Migration Commands

```bash
just db-up                       # alembic upgrade head
just db-down                     # rollback one migration
just db-revision "add table x"  # create new autogen migration
```

## Auth APIs

### `POST /auth/signup`

```json
{
  "email": "user@example.com",
  "password": "strongpassword",
  "full_name": "Sai"
}
```

### `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "strongpassword"
}
```

Both return:

```json
{
  "token": "...",
  "user_id": "...",
  "email": "user@example.com",
  "full_name": "Sai",
  "expires_at": "2026-03-08T..."
}
```

### `GET /auth/me`
Header: `Authorization: Bearer <token>`

### `POST /auth/logout`
Header: `Authorization: Bearer <token>`

## Analyze/Suggest Persistence Behavior

- If request has no auth token, file is stored under `anon` scope.
- If token is present and valid, file is stored under `user:<user_id>` scope.
- Dedup rule: `(owner_scope, file_hash)` unique.
  - same user uploads same PDF again -> existing row reused
  - no duplicate file row created
- `scan_sessions` row is created for every analyze/suggest call.

`/analyze` and `/suggest` responses now include:

- `session_id`
- `uploaded_file_id`
- `file_already_exists`

## Quality Gates

```bash
just lint-backend
just lint-frontend
just precommit
```
