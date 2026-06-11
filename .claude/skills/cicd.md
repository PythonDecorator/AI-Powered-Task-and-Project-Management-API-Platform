# CI/CD

## GitHub Actions — `.github/workflows/checks.yml`
Triggers on every push · spins up PostgreSQL + Redis · runs `python manage.py test` + `flake8`

## Setup
Add to GitHub → Settings → Secrets → Actions:
- `DOCKERHUB_USER` · `DOCKERHUB_TOKEN`

## Before every push
```bash
docker-compose run --rm backend sh -c "python manage.py wait_for_db && python manage.py test"
docker-compose run --rm backend sh -c "flake8 app/"
```
