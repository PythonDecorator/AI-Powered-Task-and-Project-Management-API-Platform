---
name: cicd
description: CI/CD pipeline setup for OneUp AI — GitHub Actions configuration and pre-push checklist.
when_to_use: Use when asked about CI/CD, GitHub Actions, pipeline configuration, secrets setup, or pre-push checks.
disable-model-invocation: true
---

# CI/CD

## Pipeline
GitHub Actions — `.github/workflows/checks.yml`
Triggers on every push. Spins up PostgreSQL + Redis, runs `python manage.py test` + `flake8`.

## Required GitHub secrets
Settings → Secrets → Actions:
- `DOCKERHUB_USER`
- `DOCKERHUB_TOKEN`

## Before every push
```bash
docker-compose run --rm backend sh -c "python manage.py wait_for_db && python manage.py test"
docker-compose run --rm backend sh -c "flake8 app/"
```
