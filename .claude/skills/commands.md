# Commands

## Start
```bash
docker-compose up --build
docker-compose run --rm backend sh -c "python manage.py wait_for_db && python manage.py migrate"
```

## Common backend
```bash
docker-compose run --rm backend sh -c "python manage.py makemigrations {app}"
docker-compose run --rm backend sh -c "python manage.py test"
docker-compose run --rm backend sh -c "python manage.py test app.{feature}.tests"
docker-compose run --rm backend sh -c "flake8 app/"
docker-compose run --rm backend sh -c "python manage.py shell"
docker-compose exec backend bash
```

## Frontend
```bash
cd frontend && npm install && npm run dev   # http://localhost:5173
npm run build · npm run lint · npm run lint --fix
```

## .env (project root)
```
DEBUG=True · DJANGO_SECRET_KEY=... · DATABASE_URL=postgresql://postgres:postgres@db:5432/oneupai_db
REDIS_URL=redis://redis:6379/0 · CELERY_BROKER_URL=redis://redis:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1 · CORS_ALLOWED_ORIGINS=http://localhost:5173
ANTHROPIC_API_KEY=... · VITE_API_URL=http://localhost:8000
```
