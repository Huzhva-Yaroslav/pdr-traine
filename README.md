# ПДР Тренажер (pdr-trainer)

Ukrainian driving-theory exam trainer. Flashcard-style practice mimicking the
official theoretical test at Ukrainian MVS Service Centers (МРЕО / ТСЦ МВС).
**Offline-first, mobile-first, Ukrainian UI** (`uk` default, `ru` optional).

> **Disclaimer / Застереження:** This is an **unofficial**, independently
> built study tool. It is **not affiliated with, endorsed by, or connected
> to** the Ukrainian Ministry of Internal Affairs (МВС), MREO, or any
> official service center. Use it to practice — always confirm current
> official rules and question content with official sources.

See [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) for full product/tech
scope, [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) for data shapes, and
[`docs/DECISIONS.md`](docs/DECISIONS.md) for architecture decisions.

## Current phase

**Phase 0 — Scaffold.** See [`docs/STATE.md`](docs/STATE.md) and
[`docs/acceptance/phase-0.md`](docs/acceptance/phase-0.md). No product
features (question bank, exam engine, training modes) exist yet — only the
dev shell and tooling.

## Requirements

- Node.js 22 LTS (see `.nvmrc`; Corepack-managed pnpm)
- pnpm `9.15.4` (pinned via `packageManager` in `package.json`)
- Python 3.12 (see `.python-version`) — needed starting Phase 1

## Install

```bash
corepack enable
corepack use pnpm@9.15.4
pnpm install
```

`pnpm install` also runs `prepare` (Husky), which installs the git hooks for
lint-staged, pre-push checks, and commit-msg linting.

## Development

```bash
pnpm dev        # start Vite dev server
pnpm build      # type-check (tsc -b) + production build to dist/
pnpm preview    # preview the production build locally
```

## Checks

```bash
pnpm lint        # ESLint (flat config)
pnpm typecheck   # tsc --noEmit (strict)
pnpm test        # vitest run
pnpm test:watch  # vitest watch mode
pnpm format      # prettier --write .
pnpm knip        # unused files/exports/deps
pnpm size        # size-limit budget for the built app
pnpm audit --audit-level=moderate
```

All of the above (except `audit`, informational) run in CI on every push and
pull request — see [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Project structure

```
/src
  /app            # providers, router, layout
  /features       # questions, exam, training, stats, settings (UI only)
  /domain         # pure business logic (exam engine, scoring, scheduling)
  /data           # Dexie schema, repositories, question loader
  /shared         # UI kit, hooks, utils, i18n
/tools            # Python data pipeline (Phase 1+)
/public/data      # versioned question bank + images (Phase 1+)
/docs             # PROJECT_BRIEF, DATA_SCHEMA, DECISIONS, STATE, acceptance
/tests/e2e        # Playwright (added in a later phase)
```

## Conventions

- Conventional Commits for git history.
- No business logic in UI components — see `.cursor/rules/*.mdc`.
- Every user-facing string is an i18n key (`uk` default).
