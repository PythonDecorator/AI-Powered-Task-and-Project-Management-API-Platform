# OneUp AI — Claude Code Instructions
Django DRF · React 18 · MUI v6 · Celery + Redis · PostgreSQL · JWT auth · Vite

## Project layout
```
backend/app/{feature}/   models · views · serializers · permissions · services · tasks · tests/
frontend/src/
  components/            GeneralForm · CrudTable · CustomModal · ActionMenu · Loading · ErrorMessage
  pages/dashboardNew/    NewBaseLayout (reuse for all dashboard routes)
  utils/helpers/         http.js · apiUrls.js · auth.js
```

## Rules
- Backend task → read `.claude/skills/backend/SKILL.md` · write `backend/` only
- Frontend task → read the relevant `.claude/skills/frontend-*/SKILL.md` · write `frontend/` only
- Reading across the boundary for context is fine; writing across it is not
- When a task touches both sides, stop and ask the user to split it
- One thing per response — one file, one function, one fix
- Keep files under 400 lines; split into focused modules when they grow beyond that
- Protected views use `JWTAuthentication` (`rest_framework_simplejwt.authentication`) — never `TokenAuthentication`

## Use the mui-mcp server to answer any MUI questions

1. Call the `useMuiDocs` tool to fetch the docs of the package relevant to the question
2. Call the `fetchDocs` tool to fetch any additional docs if needed, using ONLY the URLs present in the returned content
3. Repeat steps 1–2 until you have fetched all relevant docs for the given question
4. Use the fetched content to answer the question

## Skill index
| Task | Skill file |
|------|-----------|
| Backend models / views / tests / Celery | `.claude/skills/backend/SKILL.md` |
| Dev commands & Docker | `.claude/skills/commands/SKILL.md` |
| CI/CD pipeline | `.claude/skills/cicd/SKILL.md` |
| Dependency security audit | `.claude/skills/audit-deps/SKILL.md` |
| HTTP requests & TanStack patterns | `.claude/skills/frontend-http/SKILL.md` |
| Forms & GeneralForm | `.claude/skills/frontend-forms/SKILL.md` |
| CRUD tables & CrudTable | `.claude/skills/frontend-crud/SKILL.md` |
| Theme tokens & dark mode | `.claude/skills/frontend-theme/SKILL.md` |
| Composition, layout & polish | `.claude/skills/frontend-design/SKILL.md` |
| Shared components & MUI | `.claude/skills/frontend-components/SKILL.md` |
| Page layout & routing | `.claude/skills/frontend-pages/SKILL.md` |
