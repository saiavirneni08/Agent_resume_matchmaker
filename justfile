set shell := ["zsh", "-cu"]

default:
  @just --list

install:
  poetry install

precommit-install:
  poetry run pre-commit install

precommit:
  poetry run pre-commit run --all-files

serve:
  poetry run python -m backend.app.main

backend:
  poetry run python -m backend.app.main

frontend-install:
  cd frontend && npm install

frontend:
  cd frontend && npm run dev

check:
  poetry run python -m compileall backend/app

lint-backend:
  poetry run ruff check backend/app
  poetry run ruff format --check backend/app

lint-frontend:
  cd frontend && npm run lint

lint:
  just lint-backend
  just lint-frontend
