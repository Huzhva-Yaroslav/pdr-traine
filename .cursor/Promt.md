# Project: Ukrainian Driving Theory Exam Trainer (PWA)

## Role

You are a senior full-stack engineer building a production-grade exam-preparation
app for the theoretical driving test of the Ukrainian MVS Service Centers
(formerly MREO / ТСЦ МВС). Work step by step, one phase at a time. After each
phase: run tests, run the linter and type-check, summarize what changed, and
wait for my confirmation before starting the next phase.

## Product goal

Flashcard-style trainer with questions and road-situation images that mimics the
real exam. Offline-first, mobile-first, Ukrainian UI (Russian optional later).

## Tech stack (do not deviate without asking)

- Client: React 18 + TypeScript (strict) + Vite, PWA via vite-plugin-pwa
- Styling: Tailwind CSS
- State: Zustand (UI state), Dexie/IndexedDB (persistent progress)
- i18n: i18next (default `uk`, prepared for `ru`)
- Routing: React Router
- Tests: Vitest + React Testing Library (unit), Playwright (e2e)
- Data pipeline: Python 3.12 scripts in /tools (parse -> validate -> export JSON + WebP)
- Later: Capacitor wrapper for Android/iOS, optional Supabase for auth/sync
- Tooling: pnpm, ESLint, Prettier, Husky + lint-staged

## Architecture rules

- Feature-based structure; strict separation of layers:
  data (repositories) -> domain (pure logic) -> UI (components).
- Domain logic (exam engine, spaced repetition, scoring) must be pure functions,
  framework-free and 100% unit-tested.
- Exam rules (question count, time limit, allowed mistakes) live in a config
  file, NEVER hardcoded. Verify actual values against the official MVS source.
- The question bank is versioned static JSON (`/public/data/v{N}/`), loaded
  lazily and cached by the service worker. Updating questions must not require
  a code change.
- No `any`. No business logic in components. No global mutable state outside Zustand.
- All user-facing strings go through i18n keys.
- Accessibility: semantic HTML, keyboard navigation, WCAG AA contrast, min tap target 44px.

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
  /domain         # pure logic: examEngine, scheduler (SM-2/Leitner), scoring
  /data           # Dexie schema, repositories, question loader
  /shared         # ui kit, hooks, utils, i18n
/tools            # Python data pipeline
/public/data      # versioned question bank + images
/docs             # PROJECT_BRIEF.md, DATA_SCHEMA.md, DECISIONS.md
/tests            # e2e
```

## Data model

- Question { id, ticketId, topicId, categories[], text, answers[{id,text}],
  correctAnswerId, imageUrl?, explanation?, rulesRef? }
- Topic { id, title, order }
- Attempt { id, mode, startedAt, finishedAt, answers[], score, passed }
- UserProgress { questionId, status, correctStreak, lastSeenAt, nextReviewAt, ease }
  Write the schema to `docs/DATA_SCHEMA.md` before coding and keep it in sync.

## Phases

Phase 0 - Scaffold: Vite + TS + Tailwind + ESLint + Prettier + Vitest + CI
(GitHub Actions: lint, typecheck, test, build). Create docs/.
Phase 1 - Data pipeline: Python parser/validator/exporter, image -> WebP,
integrity report (missing images, invalid answers, duplicates), versioned output.
Phase 2 - Data layer: Dexie schema, question loader with version check,
repositories, unit tests.
Phase 3 - Question card: image, answer options, instant feedback, explanation,
rules reference. Mobile-first, swipe/keyboard support.
Phase 4 - Training modes: by ticket, by topic, random, mistakes review.
Phase 5 - Exam mode: configurable rules, timer, mistake limit, result screen
with full review. Pure engine in /domain with exhaustive tests.
Phase 6 - Stats + spaced repetition: per-topic accuracy, history chart,
weak-topic recommendations, SM-2 scheduler, "due today" queue.
Phase 7 - PWA/offline: service worker, precache bank + images, install prompt,
offline indicator, update flow for new question-bank versions.
Phase 8 - Polish: dark theme, a11y audit, performance budget (Lighthouse >= 90),
e2e tests of main flows.
Phase 9 (optional) - Auth + sync (Supabase), Capacitor builds.

## Definition of done (per phase)

- Types, lint, unit tests green; new logic covered by tests
- No TODOs left without a tracked entry in docs/DECISIONS.md
- Short changelog + how to verify manually
- Architectural decisions recorded in docs/DECISIONS.md

## Working agreements

- Before coding a phase, output a short plan and list of files you will touch.
- Prefer small, reviewable commits (Conventional Commits).
- If requirements are ambiguous or the official exam rules are unclear, ask
  instead of guessing.
- Do not add dependencies without justification.
- Legal: do not bundle the question base until its license/usage terms are checked.

Start with Phase 0 only.
