---
name: audit-deps
description: Audit all Python and Node dependencies for vulnerabilities, apply safe fixes, and confirm with a full test run. Run this periodically or when a CVE is reported.
when_to_use: Use when asked to audit dependencies, check for vulnerabilities, update packages, or run a security scan. Triggers on "CVE", "vulnerability", "outdated packages", "pip-audit", "npm audit", "security".
disable-model-invocation: true
---


# Dependency Security Audit & Update

Audit all project dependencies for vulnerabilities, update any that have fixes available, and run the full test suite to confirm nothing broke.

## Instructions

Work through these phases in order. Do not skip a phase even if the previous one finds nothing.

---

### Phase 1 — Detect what package managers are in use

Look for these files in the project root:
- `requirements.txt`, `pyproject.toml`, `Pipfile`, `setup.py` → Python (pip/pipenv/poetry)
- `package.json` → Node (npm/yarn/pnpm — check for lockfile type)
- Both → run both audits

---

### Phase 2 — Python audit (if applicable)

**2a. Install audit tool**
```bash
pip install pip-audit --quiet
```

**2b. Run audit and capture output**
```bash
pip-audit --format json -o /tmp/pip_audit_report.json
pip-audit
```

**2c. For each vulnerability found:**
- Note the package name, current version, CVE/GHSA ID, and fixed version
- Attempt upgrade:
  ```bash
  pip install --upgrade <package>
  ```
- If the package is pinned in `requirements.txt`, update the pin to the fixed version
- If using `pyproject.toml`, update the constraint there

**2d. Re-run audit to confirm clean**
```bash
pip-audit
```

---

### Phase 3 — Node audit (if applicable)

**3a. Run audit**
```bash
npm audit --json > /tmp/npm_audit_report.json
npm audit
```

**3b. Auto-fix safe updates**
```bash
npm audit fix
```

**3c. For remaining high/critical vulnerabilities that need a major version bump:**
- List them clearly
- Ask the user: "These packages have breaking-change fixes available. Shall I upgrade them? [package@version]"
- Only proceed with `npm audit fix --force` if the user confirms

**3d. Re-run audit to confirm**
```bash
npm audit
```

---

### Phase 4 — Run the full test suite

**Python:**
```bash
pytest --tb=short -q
```
If pytest is not installed or no tests found, run:
```bash
python -m pytest --tb=short -q
```

**Node / React:**
```bash
npm test -- --watchAll=false --passWithNoTests
```

If any tests fail:
- Check whether the failure is related to the packages just updated (compare test name to changed packages)
- If related: attempt to fix the compatibility issue (update import, API change, etc.)
- If unrelated: report it separately so the user knows it pre-existed this audit

---

### Phase 5 — Summary report

Print a clean summary in this format:

```
═══════════════════════════════════════
  DEPENDENCY AUDIT REPORT
═══════════════════════════════════════

Python
  Vulnerabilities found:    X
  Packages updated:         X
  Remaining (need review):  X

Node
  Vulnerabilities found:    X
  Packages updated:         X
  Remaining (need review):  X

Tests
  Passed:  X
  Failed:  X  ← list any failures here

Packages updated:
  - flask 2.2.3 → 2.3.3 (CVE-2023-30861)
  - requests 2.28.0 → 2.31.0 (CVE-2023-32681)
  - ...

Action needed:
  - <anything that requires a breaking-change upgrade or manual review>
═══════════════════════════════════════
```

---

## Notes

- Never downgrade a package to fix a vulnerability — only upgrade
- If a package has no fixed version available yet, note it in "Action needed" with the CVE link
- Do not run `npm audit fix --force` without explicit user confirmation — it can introduce breaking changes
- If tests were already failing before the audit, note that clearly so the user is not confused
