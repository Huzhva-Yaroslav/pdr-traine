# Ukrainian Driving Theory Exam Trainer — Project Brief

## Product goal

Flashcard-style trainer with questions and road-situation images that mimics the real theoretical driving test at Ukrainian MVS Service Centers (formerly MREO / ТСЦ МВС). **Offline-first**, **mobile-first**, Ukrainian UI (`uk` default; Russian optional later).

## Tech stack (do not deviate without ADR)

| Layer | Choice |
|-------|--------|
| Client | React 18, TypeScript (strict), Vite |
| PWA | `vite-plugin-pwa` (later phases) |
| Styling | Tailwind CSS |
| UI state | Zustand |
| Persistence | Dexie / IndexedDB |
| i18n | i18next (`uk` default, `ru` prepared) |
| Routing | React Router |
| Unit tests | Vitest + React Testing Library |
| E2E | Playwright |
| Data pipeline | Python 3.12 in `/tools` (parse → validate → export JSON + WebP) |
| Package manager | pnpm |
| Quality | ESLint, Prettier, Husky + lint-staged |
| CI | GitHub Actions |
| Hosting | Cloudflare Pages (see ADR-0005) |
| Later (optional) | Capacitor (Android/iOS), Supabase auth/sync |

## Architecture rules

- **Feature-based structure** with strict layering: **data (repositories) → domain (pure logic) → UI (components)**.
- **Domain** (exam engine, spaced repetition, scoring, selection) = pure functions, framework-free, fully unit-tested.
- **Exam rules** (question count, time limit, allowed mistakes, fail-fast, skip behavior) live in **config only** — never hardcoded in UI or domain constants. Verify against official MVS sources when integrating real data.
- **Question bank**: versioned static JSON under `/public/data/v{N}/`, lazy-loaded, SW-cached in Phase 7. Bank updates must not require app code changes.
- No `any`. No business logic in React components. No global mutable state outside Zustand stores.
- All user-facing strings via i18n keys.
- **Accessibility**: semantic HTML, keyboard navigation, WCAG AA contrast, minimum tap target 44px.

## Exam simulation rules (default config)

These values are the **initial** `ExamConfig` defaults; production must read them from config and validate against official rules.

| Rule | Value |
|------|--------|
| Questions per attempt | **20** |
| Time limit | **20 minutes** |
| Maximum mistakes allowed | **2** (3rd mistake ends the exam) |
| Fail-fast | **Yes** — exam ends immediately when mistake limit is exceeded |
| Skip | **Allowed** — user may skip a question and return later within the same attempt |
| Pass | Finish within time with at most **2** incorrect answers (skipped questions must be resolved per engine rules before finish) |

Domain `examEngine` implements behavior; UI only reflects state.

## Folder structure

```
/src
  /app            # providers, router, layout
  /features
    /questions    # card UI, answer checking
    /exam         # exam simulation
    /training     # by-topic, by-ticket, random, mistakes
    /stats        # progress, charts, weak topics
    /settings
  /domain         # examEngine, scheduler, scoring, selection, stats
  /data           # Dexie schema, repositories, question loader
  /shared         # ui kit, hooks, utils, i18n
/tools            # Python data pipeline
/public/data     # versioned question bank + images
/docs             # PROJECT_BRIEF, DATA_SCHEMA, DECISIONS, STATE, acceptance
/tests            # e2e (Playwright)
```

## Phases (0–8 + optional 9)

| Phase | Name | Summary |
|-------|------|---------|
| **0** | Scaffold | Vite + TS + Tailwind + ESLint + Prettier + Vitest + CI (lint, typecheck, test, build). Project docs and Cursor rules. |
| **1** | Data pipeline | Python parse/validate/export, WebP images, integrity report, versioned `public/data/v{N}/`. |
| **2** | Data layer | Dexie schema, question loader + version check, repositories, unit tests. |
| **3** | Question card | Image, answers, instant feedback, explanation, rules ref; mobile-first, swipe/keyboard. |
| **4** | Training modes | By ticket, topic, random, mistakes review. |
| **5** | Exam mode | Config-driven rules, timer, mistake limit, result + review; pure `examEngine` with exhaustive tests. |
| **6** | Stats + SR | Per-topic accuracy, history, weak topics, SM-2/Leitner scheduler, due queue. |
| **7** | PWA / offline | Service worker, precache bank + images, install prompt, offline indicator, bank update flow. |
| **8** | Polish | Dark theme, a11y audit, Lighthouse ≥ 90 mobile, e2e main flows. |
| **9** *(optional)* | Auth + native | Supabase sync, Capacitor builds. |

## Definition of done (every phase)

1. **Types, lint, and unit tests green**; new logic covered by tests.
2. **No untracked TODOs** — each deferred item has an entry in `docs/DECISIONS.md` (Backlog or ADR).
3. **Short changelog** + manual verification steps for the phase.
4. **Architectural decisions** recorded in `docs/DECISIONS.md`.
5. Phase-specific checklist in `docs/acceptance/phase-N.md` satisfied where applicable.

## Working agreements

- Before coding a phase: short plan + file list; one phase at a time; user confirmation before the next phase.
- Small, reviewable commits (Conventional Commits).
- Ambiguous requirements or official exam rules → ask; do not guess.
- New dependencies → justify in ADR or phase plan.
- **Legal**: do not ship the real MVS question base until license/usage terms are confirmed (see ADR-0002).

## References

- Data shapes: `docs/DATA_SCHEMA.md`
- Decisions: `docs/DECISIONS.md`
- Current phase: `docs/STATE.md`
