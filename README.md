# GOD MODE Handoff Package

Version: 1.0 Canonical Design Baseline (2026-09-12)

Files:

- `GOD_MODE_Canonical_Build_Specification.docx` — polished master build handoff.
- `GOD_MODE_Canonical_Build_Specification.md` — agent-friendly version for Cursor.
- `GOD_MODE_Independent_Validation_UAT.docx` — polished independent validation and UAT handoff.
- `GOD_MODE_Independent_Validation_UAT.md` — agent-friendly reviewer version.
- `GOD_MODE_Cursor_Builder_Prompt.md` — short operating prompt for the builder agent.
- `GOD_MODE_Grok_Reviewer_Prompt.md` — short operating prompt for Grok/reviewer.

Recommended loop:

1. Give Cursor the canonical build spec + builder prompt.
2. Cursor implements one milestone and exports a review bundle.
3. Give Grok the canonical spec, validation spec, reviewer prompt, and review bundle.
4. Grok returns a requirement-ID-based review.
5. Give that review back to Cursor.
6. Repeat until milestone PASS, then move to the next milestone.
