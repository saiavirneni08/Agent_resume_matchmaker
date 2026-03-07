set shell := ["zsh", "-cu"]

default:
  @just --list

install:
  poetry install

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
