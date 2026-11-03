# Data pipeline (`/tools`)

Placeholder for the Phase 1 Python data pipeline.

## Planned scope (Phase 1)

- Python 3.12 (see `.python-version`).
- Parse the raw question source (`tools/raw/`, git-ignored) into the shapes
  defined in [`docs/DATA_SCHEMA.md`](../docs/DATA_SCHEMA.md).
- Validate questions/topics/answers (required fields, FK integrity,
  unique ids, UTF-8 NFC text).
- Convert question images to WebP.
- Export versioned bundles to `public/data/v{N}/` (`questions.json`,
  `topics.json`, `manifest.json`, `images/`).
- Produce an integrity report (counts, checksums, diff vs. previous version).

Until Phase 1 lands, `/tools` only contains this stub and no pipeline code
runs as part of the app build.
