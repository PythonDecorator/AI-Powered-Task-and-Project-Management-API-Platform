## Backend Rules
- **Strict Scope**: `backend/` ONLY. NEVER touch or suggest `frontend/` code.
- **Read Scope**: May reference shared `backend/utils/` or other apps for context/imports.
- **Write Scope**: Focus on ONE app at a time. Only write/modify files inside `backend/app/{feature}/`.

## Structure
`backend/app/{feature}/` → `models.py · views.py · urls.py · serializers.py . permissions.py · services.py · helpers.py · tasks.py · tests/`
- Fat serializers, thin views · explicit `permission_classes` on every view · always `select_related`/`prefetch_related`
- Max line length: 120 chars · Max file length: 400 lines — split if exceeded · move some to `backend/app/{feature}/helpers.py` if file too long

## utils — always check first, never duplicate
`backend/app/utils/helpers.py` or `backend/app/{feature}/helpers.py` — all other helpers
- `send_emails.py` → `send_email(subject, recipient_list, ...)` — all email, debug + SendGrid production
- `email_templates.py` → `EMAIL_TEMPLATES` dict — add new templates here only
- `create_test_model.py` → `TestDb` — all test fixtures

## Celery
Anything >2s, external APIs, bulk writes → Celery. Thin tasks: instantiate + `.run()` only · list of IDs always · `@shared_task` · companion `retry_failed_*` per task · `bind=True` + `max_retries=3` for external calls.

## Cache
Key: `{feature}_{action}_{id}` · TTLs: user=300s · reports=900s · reference=3600s · static=86400s · invalidate on write · never skip TTL.

## Testing Rules
- **Structure**: `tests/` dir only (no `tests.py`). Split strictly: `test_models.py`, `test_serializers.py`, `test_permissions.py`, `test_api.py`.
- **DRY/TestDb**: NEVER create users/mocks directly in tests. Always use `TestDb`.
- **New Models**: Add `create_{model}()` to `TestDb` before testing.
- **Setup Pattern**: `self.db=TestDb()` -> `self.user=self.db.create_user()`.
- **Coverage Matrix**: Every feature MUST cover:
  1. *Happy Path*: Valid data, successful operations.
  2. *Failure*: IntegrityErrors, validation failures.
  3. *Permissions*: 401 unauth, 403 non-owner, safe vs. unsafe methods.

## Running Tests with Docker
- **Start containers**: `docker-compose up -d` (from backend/ directory)
- **Run all tests**: `docker-compose exec backend python manage.py test`
- **Run specific app**: `docker-compose exec backend python manage.py test {app_name}.tests`
- **Run specific test file**: `docker-compose exec backend python manage.py test {app_name}.tests.test_models`
- **With verbosity**: Add `-v 2` or `-v 3` to see test output details
- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f backend` (follow backend logs)
