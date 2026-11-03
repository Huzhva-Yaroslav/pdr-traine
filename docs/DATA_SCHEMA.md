# Data schema

Single source of truth for question-bank JSON, client types, and Dexie persistence. **Keep in sync** with `/tools` exporters and `/src/data`.

Versioning: static bank lives at `public/data/v{N}/`. Client reads `manifest.json` first.

---

## Question

Exam/training unit. Exported in `questions.json` (array).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `id` | `string` | yes | Stable globally unique id |
| `ticketId` | `string` | yes | Ticket / billet grouping |
| `topicId` | `string` | yes | FK → `Topic.id` |
| `categories` | `string[]` | yes | Official category tags |
| `text` | `string` | yes | Question stem (UTF-8 NFC) |
| `answers` | `Answer[]` | yes | 2–n options |
| `correctAnswerId` | `string` | yes | Must match one `answers[].id` |
| `images` | `string[]` | no | Paths relative to bank root, e.g. `images/q-123.webp` |
| `explanation` | `string` | no | Shown after answering in training |
| `rulesRef` | `string` | no | Reference to traffic rules section |

### Answer

| Field | Type | Required |
|-------|------|----------|
| `id` | `string` | yes |
| `text` | `string` | yes |

---

## Topic

Exported in `topics.json` (array).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `id` | `string` | yes | |
| `title` | `string` | yes | Localized in bank export (`uk` initially) |
| `order` | `number` | yes | Display sort key |

---

## Manifest

`manifest.json` at each bank version root.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `version` | `number` | yes | Monotonic integer `N` in path `v{N}` |
| `generatedAt` | `string` | yes | ISO 8601 UTC |
| `questionCount` | `number` | yes | |
| `topicCount` | `number` | yes | |
| `checksums` | `Record<string, string>` | yes | e.g. SHA-256 of `questions.json`, `topics.json` |
| `diff` | `ManifestDiff` | no | Present when upgrading from previous version |

### ManifestDiff

Summary for client migration and update UX.

| Field | Type | Notes |
|-------|------|--------|
| `previousVersion` | `number` | Source bank version |
| `addedQuestionIds` | `string[]` | |
| `removedQuestionIds` | `string[]` | |
| `changedQuestionIds` | `string[]` | Content hash changed |
| `unchangedQuestionIds` | `string[]` | Optional; omit if large |

---

## Attempt (client / Dexie)

One training or exam session.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `id` | `string` | yes | UUID |
| `mode` | `'exam' \| 'training'` | yes | |
| `startedAt` | `string` | yes | ISO 8601 |
| `finishedAt` | `string` | no | Set when completed or aborted |
| `answers` | `AttemptAnswer[]` | yes | Ordered log |
| `score` | `number` | no | Computed at finish |
| `passed` | `boolean` | no | Exam only |

### AttemptAnswer

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `questionId` | `string` | yes | |
| `answerId` | `string \| null` | yes | `null` if skipped or not yet chosen |
| `status` | `'answered' \| 'skipped'` | yes | |
| `answeredAt` | `string` | yes | ISO 8601 (skip timestamp when skipped) |

---

## UserProgress (client / Dexie)

Spaced repetition and mistake tracking per question.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `questionId` | `string` | yes | PK |
| `status` | `'new' \| 'learning' \| 'mistake' \| 'mastered'` | yes | |
| `correctStreak` | `number` | yes | Default `0` |
| `lastSeenAt` | `string` | no | ISO 8601 |
| `nextReviewAt` | `string` | no | ISO 8601 |
| `ease` | `number` | no | SM-2 ease factor |
| `orphaned` | `boolean` | no | `true` if question removed from current bank |
| `contentHash` | `string` | no | Hash of question content at last sync; detect edits |

---

## ExamConfig (client config file)

Not part of bank JSON. Loaded at runtime; drives `examEngine` only.

| Field | Type | Default (initial) |
|-------|------|-------------------|
| `questionCount` | `number` | `20` |
| `timeLimitMinutes` | `number` | `20` |
| `maxMistakes` | `number` | `2` |
| `failFast` | `boolean` | `true` |
| `allowSkipAndReturn` | `boolean` | `true` |

---

## Open questions / TBD

- Exact category enum from official source (Phase 1).
- Whether `ticketId` is always present in live MVS data (pipeline validation).
- Dexie table names and indexes (Phase 2).
