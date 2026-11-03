# Phase 0 acceptance checklist

Scaffold only — no exam/training/question-bank product features beyond a minimal dev shell.

## Commands (must all pass locally and in CI)

| # | Check | Command |
|---|--------|---------|
| 1 | Lint | `pnpm lint` |
| 2 | Typecheck | `pnpm exec tsc --noEmit` |
| 3 | Unit tests | `pnpm exec vitest run` |
| 4 | Production build | `pnpm build` |
| 5 | Unused exports/deps | `pnpm exec knip` (or `pnpm knip` if scripted) |
| 6 | Dependency audit | `pnpm audit --audit-level=moderate` (document exceptions in DECISIONS if needed) |

## Documentation

- [ ] `docs/PROJECT_BRIEF.md` present and matches stack/phases
- [ ] `docs/DATA_SCHEMA.md` skeleton complete
- [ ] `docs/DECISIONS.md` includes ADR-0001 through ADR-0005
- [ ] `docs/STATE.md` reflects phase 0 completion when done
- [ ] `.cursor/rules/domain.mdc`, `frontend.mdc`, `tools.mdc` present

## Repository hygiene

- [ ] `pnpm-lock.yaml` committed
- [ ] `.github/workflows/ci.yml` runs checks 1–4 at minimum (5–6 recommended)
- [ ] README: install, dev, test, build (brief)
- [ ] No secrets in repo; `.env.example` if env vars introduced

## Explicitly out of scope for Phase 0

- Dexie schema, question loader, exam engine
- Python pipeline beyond placeholder `/tools/README.md` (optional stub)
- PWA service worker, real question bank, i18n content beyond setup hook

## Sign-off

- [ ] Orchestrator verified all checks green
- [ ] User confirmed ready for Phase 1
