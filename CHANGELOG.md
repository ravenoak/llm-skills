# Changelog

All notable changes to this project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Until the first tagged release, "version" refers to the marketplace's layout/schema contract observed by external consumers (the path of `.claude-plugin/marketplace.json`, the shape of its plugin entries, and the install-time directory layout). Per-skill versions live in each `plugins/<id>/skill.json`.

## [Unreleased]

### Added
- `reasoning-framework` skill (v0.2.0) — pluralistic, multi-disciplinary reasoning lens.
- `docs/installing.md` covering every install target (Claude Code marketplace, single SKILL.md copy, OpenAI custom GPTs, portable format).
- CI step that validates every emitted `.claude-plugin/marketplace.json#plugins[*]` against `spec/marketplace-entry.schema.json` (previously CI only compiled the schema, so emitted/schema drift could slip through).

### Changed (breaking — marketplace layout)
- Marketplace name is now `ravenoak-llm-skills` (was `llm-skills`); install command is `/plugin install <skill>@ravenoak-llm-skills`.
- Marketplace + plugin manifests moved to `.claude-plugin/` (`.claude-plugin/marketplace.json` and `plugins/<id>/.claude-plugin/plugin.json`); previously these lived at the repo root. Without this, `/plugin marketplace add` failed with `Marketplace file not found`.
- Source directory renamed `skills/` → `plugins/`. Each `plugins/<id>/` is now a standalone Claude Code plugin with its own manifest.
- Each skill ships as its own installable plugin; the prior single-bundle plugin model is gone. SKILL.md now lives at `plugins/<id>/skills/<id>/SKILL.md` (the nested layout Claude Code auto-discovers).
- Root `plugin.json` removed (the repo is a marketplace, not also a plugin).
- `spec/marketplace-entry.schema.json` updated to match the actual emitted shape (object `author`, `homepage`, `repository`, `license`, `keywords`); the unused legacy `tags` field has been dropped.

### Fixed
- `pip-audit --strict` in CI was failing on every PR because the project's own `llm-skills` Python package isn't published to PyPI. Switched to `--skip-editable` (validate + audit workflows); real vulnerabilities in dependencies still surface.
- `tools/ts/tsconfig.json` now sets `types: ["node"]` explicitly. Vite 8 / vitest 4 stopped emitting the triple-slash references TS 6 was relying on for automatic `@types/node` discovery, which broke every `import "node:..."`.

### Known issues (carried forward)
- The `openai-gpt` and `portable` build targets emit artifacts under `dist/` but have not been independently confirmed against a real OpenAI custom GPT or a downstream portable-format consumer. Mark as **untested** in docs.
- Main's `validate` workflow's `security` job (Semgrep, full-repo scan) flags the deliberate `AKIA…` test fixture in `tools/ts/test/lint.test.ts` as a real AWS key. Pre-existing; PR-context scans (diff-only) pass.

### Dependency bumps
- GitHub Actions: `setup-uv` 3→7, `action-gh-release` 2→3, `setup-node` 4→6, `create-issue-from-file` 5→6, `checkout` 4→6.
- npm: `@types/node` 24→25, `commander` 12→14, `typescript` 5→6, `vitest` 2→4, `eslint` 9→10.
