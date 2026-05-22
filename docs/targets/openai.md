# Target: openai-gpt

Emits two files per skill into `dist/openai/<id>/`:

- `manifest.json` — `{ name, description, conversationStarters, capabilities, actionsSchema? }`
- `instructions.md` — body (or `overrides/openai-gpt.md` if present)

Use these to populate a custom GPT or App. The bundle is packaged as `openai-bundle.tar.gz` at release time.
