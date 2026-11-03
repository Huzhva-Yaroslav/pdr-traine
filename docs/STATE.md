# Project state

| Field | Value |
|-------|--------|
| **Current phase** | **0 — Scaffold** |
| **Status** | **Complete, pending user sign-off** |
| **Branch** | `phase-0-scaffold` |
| **Last updated** | 2026-11-03 |

## Phase 0 progress

| Item | Status |
|------|--------|
| `docs/PROJECT_BRIEF.md` | Done |
| `docs/DATA_SCHEMA.md` | Done |
| `docs/DECISIONS.md` (ADR-0001–0005) | Done |
| `docs/acceptance/phase-0.md` | Done |
| `.cursor/rules/*.mdc` | Done |
| Vite + React 18 + TS strict scaffold | Done |
| Tailwind + PostCSS | Done |
| ESLint (flat) + Prettier + Husky + lint-staged | Done |
| Vitest + RTL smoke test (`App.test.tsx`) | Done |
| i18n (`i18next`/`react-i18next`), `uk`/`ru` locales | Done |
| GitHub Actions CI (`lint`, `typecheck`, `test`, `build`, `knip`, `audit`) | Done |
| knip + `pnpm audit` in CI or scripts | Done |
| Minimal app shell (title + disclaimer, no product features) | Done |

All Phase 0 commands pass locally: `pnpm install`, `pnpm lint`,
`pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm knip`, `pnpm size`.
`pnpm audit --audit-level=moderate --prod` is clean; see
`docs/DECISIONS.md` for a note on dev-only audit findings.

## Blockers

None.

## Next gate

Complete Phase 0 acceptance checklist → user confirmation → Phase 1 plan.
