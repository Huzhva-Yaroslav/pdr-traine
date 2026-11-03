# Architecture Decision Records (ADR)

Format: **ADR-NNNN** — title, date, status, context, decision, alternatives, consequences.

---

## ADR-0001 — Client and tooling stack

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** Need a maintainable offline-first PWA with strict typing, fast dev loop, and testable domain logic.

**Decision:** React 18 + TypeScript (strict) + Vite; Tailwind; Zustand + Dexie; i18next; React Router; Vitest + RTL; Playwright e2e; Python 3.12 pipeline in `/tools`; pnpm; ESLint + Prettier + Husky.

**Alternatives considered:** Next.js (heavier, SSR not required); Redux (more boilerplate); raw IndexedDB (error-prone).

**Consequences:** Team follows layer boundaries in `docs/PROJECT_BRIEF.md`. New stack choices require a new ADR.

---

## ADR-0002 — Synthetic question bank until license confirmed

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** Official MVS question content may be subject to copyright and usage restrictions. Shipping scraped content without legal review is unacceptable.

**Decision:** Develop and test against a **small synthetic** bank in repo until license/usage terms for the official base are verified. Pipeline structure and schema match production; only source data differs.

**Alternatives considered:** Bundle official dump immediately (rejected — legal risk); empty app (blocks UX validation).

**Consequences:** Phase 1 builds full pipeline with fixtures; swap-in of real data is a content/version bump, not an architecture change. Record license outcome in a follow-up ADR.

---

## ADR-0003 — Exam rules from config only

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** Real exam parameters (20 questions, 20 minutes, 2 mistakes, fail-fast, skip/return) may be adjusted after official verification or for training variants.

**Decision:** All exam parameters live in **`ExamConfig`** (see `docs/DATA_SCHEMA.md`). Domain `examEngine` accepts config; UI and components never embed numeric rules.

**Alternatives considered:** Hardcoded constants in domain (rejected — violates testability and product flexibility).

**Consequences:** Phase 5 requires config file + exhaustive domain tests. Changing rules is a config/docs change, not scattered magic numbers.

---

## ADR-0004 — No third-party analytics

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** Exam prep handles learning behavior; minimize data collection and GDPR surface.

**Decision:** **No** Google Analytics, Mixpanel, or similar telemetry in the client. Progress stays on-device (Dexie). Optional future sync only via explicit opt-in ADR (Supabase Phase 9).

**Alternatives considered:** Privacy-friendly analytics (deferred — add ADR if needed).

**Consequences:** No analytics SDK in dependencies. Product insights from manual testing and optional aggregated e2e in CI only.

---

## ADR-0005 — Cloudflare Pages hosting

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** Static SPA + versioned JSON/WebP assets; need global CDN, simple CI deploy, low cost.

**Decision:** Deploy production builds to **Cloudflare Pages** (build command: `pnpm build`, output: `dist`).

**Alternatives considered:** GitHub Pages (works but weaker CDN/headers); Vercel (fine; no strong requirement); self-hosted (ops burden).

**Consequences:** Document env and preview URLs in Phase 0 CI. Ensure cache headers for `public/data/v{N}/` align with SW strategy in Phase 7.

---

## ADR-0006 — Phase 0 dev-dependency audit exceptions

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Status** | Accepted |

**Context:** `pnpm audit --audit-level=moderate` (full graph) reports
moderate/high/critical advisories solely in **devDependencies** (e.g.
`@vitest/mocker` path-traversal/mock-injection advisories, transitive
`minimatch` ReDoS via `eslint`'s config tooling). `pnpm audit --prod` is
clean — these packages never ship in the production bundle.

**Decision:** CI runs `pnpm audit --audit-level=moderate --prod` (informational,
`continue-on-error`) as the Phase 0 gate. Full-graph dev-tooling advisories are
tracked here instead of blocking the pipeline; bump the affected dev tool
when a patched release is available.

**Alternatives considered:** Fail CI on any advisory (rejected — blocks on
test/lint tooling with no runtime exposure); ignore audit entirely (rejected
— loses visibility into production dependency risk).

**Consequences:** Re-check `pnpm audit` (full graph) periodically and when
bumping `vitest`/`eslint`; update or remove this ADR once dev tooling patches
land.

---

## Backlog (out of current phase)

Items here are **not** approved work until scheduled in a phase plan.

| Item | Notes |
|------|--------|
| Supabase auth/sync | Phase 9 optional |
| Capacitor native shells | Phase 9 optional |
| Russian UI | i18n keys prepared; content later |
| Official MVS question import | Blocked on ADR-0002 legal clearance |
| Property-based tests (fast-check) | Domain scheduler; Phase 6 |
