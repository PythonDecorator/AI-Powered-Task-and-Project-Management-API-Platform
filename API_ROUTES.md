# 🔌 Backend API Routes

> **34 endpoints** across 6 features · All protected routes require `Authorization: Bearer <token>`
> 
> `🔒` = JWT required · Auto-triggers = fired by Django signals, no endpoint needed

---

## 🔐 Auth — `/api/auth/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | email · password · first_name · last_name |
| `POST` | `/login` | email · password → `access_token` + `refresh_token` |
| `POST` | `/token/refresh` | refresh_token → new access_token |
| `GET` | `/me` | 🔒 current user profile |
| `PATCH` | `/me` | 🔒 update profile · avatar |
| `POST` | `/confirm-email` | token → marks `is_email_confirmed = True` |
| `POST` | `/password-reset/request` | email → sends reset code via SendGrid |
| `POST` | `/password-reset/confirm` | code · new_password → updates password |
| `POST` | `/logout` | 🔒 revokes `UserToken` from DB |

---

## 🏢 Organisations — `/api/orgs/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | 🔒 create org · auto-assigns creator as owner |
| `GET` | `/me` | 🔒 list all orgs for current user |
| `GET` | `/{org_id}/` | 🔒 org detail + member count |
| `PATCH` | `/{org_id}/` | 🔒 owner only · update name / slug |
| `POST` | `/{org_id}/invite/` | 🔒 admin+ · email · role → sends invite email |
| `GET` | `/{org_id}/members/` | 🔒 list members with role + open task count |
| `PATCH` | `/{org_id}/members/{user_id}/` | 🔒 admin+ · change member role |
| `DELETE` | `/{org_id}/members/{user_id}/` | 🔒 admin+ · remove member |

---

## 📁 Projects — `/api/projects/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | 🔒 org_id · name · description |
| `GET` | `/` | 🔒 `?org_id=` `?status=` `?page=` `?limit=` |
| `GET` | `/{project_id}/` | 🔒 project detail + member count + task stats |
| `PATCH` | `/{project_id}/` | 🔒 admin+ · name · description · status |
| `DELETE` | `/{project_id}/` | 🔒 owner only · soft delete → `status=archived` |

---

## ✅ Tasks — `/api/tasks/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | 🔒 project_id · title · description · due_date |
| `GET` | `/` | 🔒 `?project_id=` `?status=` `?assignee=` `?priority=` `?page=` |
| `GET` | `/{task_id}/` | 🔒 task detail + `ai_summary` + `ai_priority_score` |
| `PATCH` | `/{task_id}/` | 🔒 title · description · status · priority · due_date |
| `PATCH` | `/{task_id}/assign/` | 🔒 assignee_id → reassign task |
| `DELETE` | `/{task_id}/` | 🔒 soft delete → `status=deleted` |

### 💬 Comments — `/api/tasks/{task_id}/comments/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | 🔒 body → creates comment, returns thread |
| `GET` | `/` | 🔒 paginated comment thread for task |
| `DELETE` | `/{comment_id}/` | 🔒 author or admin only |

---

## ✨ AI — `/api/ai/`

> The standout feature. All heavy work runs through Celery — HTTP responses are instant.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tasks/{task_id}/analyse/` | 🔒 enqueues Celery → Claude scores priority + writes `ai_summary` · returns `{"status": "queued"}` |
| `GET` | `/tasks/{task_id}/analyse/` | 🔒 **poll this** → returns `ai_summary` · `ai_priority_score` · `ai_suggested_priority` · `reasoning` |
| `GET` | `/tasks/{task_id}/suggest-assignee/` | 🔒 Claude picks best member by open task workload → `{recommended_user_id, reason}` |
| `POST` | `/projects/{project_id}/report/` | 🔒 admin+ · enqueues Celery → Claude writes health report · cached 30 min |
| `GET` | `/projects/{project_id}/report/` | 🔒 returns cached report — blockers · risks · progress summary |

### How the AI flow works

```
Frontend                         Backend                        Celery + Claude
   │                                │                                │
   │  POST /tasks/{id}/analyse/     │                                │
   │──────────────────────────────▶ │                                │
   │  ← {"status": "queued"}        │  enqueue analyse_task_async() ─▶
   │                                │                                │
   │  GET /tasks/{id}/analyse/      │                                │  Claude scores priority
   │──────────────────────────────▶ │  ← null (still processing)    │  + writes ai_summary
   │                                │                                │
   │  GET /tasks/{id}/analyse/      │                                │  saves to DB
   │──────────────────────────────▶ │  ← ai_summary + score ◀───────│
   │  show result in UI             │
```

### Automatic triggers (no endpoint needed)

| Event | Trigger |
|-------|---------|
| Task created | Auto-enqueues `analyse_task_async(task_id)` via Django signal |
| Task description updated | Re-enqueues `analyse_task_async(task_id)` via Django signal |

---

## 🔔 Notifications — `/api/notifications/`

> Created automatically by Celery when tasks are assigned, updated, or AI analysis completes.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | 🔒 unread + recent · `?unread_only=true` |
| `PATCH` | `/{id}/read/` | 🔒 mark single notification read |
| `PATCH` | `/read-all/` | 🔒 mark all notifications read |

---

## 📦 Response envelope (all list endpoints)

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

## 🗂️ Django app → endpoint mapping

| App | Handles |
|-----|---------|
| `app/core/` | `/api/auth/*` |
| `app/organisations/` | `/api/orgs/*` |
| `app/projects/` | `/api/projects/*` |
| `app/tasks/` | `/api/tasks/*` + `/api/tasks/{id}/comments/*` |
| `app/ai/` | `/api/ai/*` |
| `app/notifications/` | `/api/notifications/*` |

## ⚡ Redis cache TTLs

| Endpoint | TTL | Invalidated by |
|----------|-----|----------------|
| `GET /projects/{id}/` | 5 min | project update |
| `GET /projects/` | 5 min | project create / delete |
| `GET /tasks/` | 2 min | any task change in project |
| `GET /ai/projects/{id}/report/` | 30 min | manual `POST` re-trigger |
| `GET /orgs/{id}/members/` | 5 min | membership change |
