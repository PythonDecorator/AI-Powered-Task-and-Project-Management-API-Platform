---
name: backend
description: Django DRF backend patterns for OneUp AI. Read before touching any file in backend/. Covers structure, models, views, serializers, Celery tasks, caching, and testing.
when_to_use: Use when writing or editing models, views, serializers, permissions, services, Celery tasks, or tests. Use when asked about Django patterns, database queries, authentication, or backend architecture.
paths: backend/**
---

# Backend

## Current context
Branch: !`git branch --show-current 2>/dev/null || echo "unknown"`
Changed backend files: !`git diff --name-only HEAD 2>/dev/null | grep "^backend/" | head -20 || echo "none"`

## Scope
Write only inside `backend/app/{feature}/`. Never touch `frontend/`.

## Key imports
```python
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions, serializers, viewsets
from utils.helpers import PaginateItems          # paginator → returns totalItems, not count
from utils.helpers.send_emails import send_email
from utils.helpers.email_templates import EMAIL_TEMPLATES
from app.utils.create_test_model import TestDb   # all test fixtures
```

## Feature structure
```
backend/app/{feature}/
  models.py · serializers.py · views.py · urls.py · permissions.py
  services.py    ← business logic (views call this, not the other way)
  helpers.py     ← feature-specific utilities
  tasks.py       ← Celery tasks; call service methods, nothing else
  tests/
    test_models.py · test_serializers.py · test_permissions.py · test_api.py
```

Business logic lives in `services.py`. Views are thin — they validate input, call a service, and return a response. Serializers handle shape, not logic.

## ViewSet pattern
```python
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions, viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from utils.helpers import PaginateItems

class ManageResourceView(viewsets.ModelViewSet):
    serializer_class = serializers.YourSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageResource]
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['id', 'name', 'created_at']
    queryset = YourModel.objects.none()

    def get_queryset(self):
        return (
            YourModel.objects
            .filter(organization=self.request.user.member.organization)
            .select_related('organization')
            .prefetch_related('related_items')
        )
```

`get_queryset()` must always scope to the user's organization. Use `select_related` / `prefetch_related` — never let queries run in loops.

## Services
```python
# services.py
class ResourceService:
    @staticmethod
    def create(organization, validated_data: dict) -> YourModel:
        instance = YourModel.objects.create(organization=organization, **validated_data)
        send_email(
            subject=EMAIL_TEMPLATES['resource_created']['subject'],
            recipient_list=[organization.owner.email],
            template_key='resource_created',
            context={'instance': instance},
        )
        return instance
```

## Celery tasks
Offload anything slow (>2s), external API calls, or bulk writes to a task. Tasks should be thin wrappers around service calls.

```python
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def process_resources(self, resource_ids: list[int]):
    try:
        ResourceService.process_batch(resource_ids)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

Pass IDs, not querysets. Pair every task with a `retry_failed_*` companion.

## Cache
Key pattern: `{feature}_{action}_{id}` · Invalidate on write · Never skip TTL

| Data type | TTL |
|-----------|-----|
| User data | 300s |
| Reports | 900s |
| Reference data | 3600s |
| Static/config | 86400s |

## Shared utilities — check before writing new ones
- `utils/helpers/send_emails.py` → `send_email(subject, recipient_list, template_key, context)`
- `utils/helpers/email_templates.py` → `EMAIL_TEMPLATES` dict
- `utils/create_test_model.py` → `TestDb`
- `utils/helpers.py` → general helpers

## Testing

Tests live in `tests/` (not `tests.py`). Use `TestDb` for all fixtures — never create users or orgs directly in tests.

```python
from app.utils.create_test_model import TestDb

class MyTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.org = self.db.create_organization()
        self.owner = self.db.create_user(organization=self.org, role='owner')
        self.member = self.db.create_user(organization=self.org, role='member')
```

If you need a fixture method that doesn't exist in `TestDb`, add it there first.

Every feature needs tests covering:
1. Happy path — valid data, expected response
2. Failure cases — IntegrityErrors, validation errors, bad input
3. Permissions — 401 unauthenticated, 403 wrong role, safe vs unsafe methods

```python
from rest_framework.test import APIClient, APITestCase

class ResourceAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.db = TestDb()
        self.org = self.db.create_organization()
        self.owner = self.db.create_user(organization=self.org, role='owner')

    def test_list_authenticated(self):
        self.client.force_authenticate(user=self.owner)
        self.assertEqual(self.client.get('/api/v1/resource/').status_code, 200)

    def test_list_unauthenticated(self):
        self.assertEqual(self.client.get('/api/v1/resource/').status_code, 401)
```

Run tests: see `.claude/skills/commands/SKILL.md`
