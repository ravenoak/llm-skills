# Changelog

All notable changes to this project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Until the first tagged release, "version" refers to the marketplace's layout/schema contract observed by external consumers (the path of `.claude-plugin/marketplace.json`, the shape of its plugin entries, and the install-time directory layout). Per-skill versions live in each `plugins/<id>/skill.json`.

## [Unreleased]

### Added
- `reasoning-framework` skill (v0.3.0) — pluralistic, multi-disciplinary reasoning lens.
- `reasoning-swarm` skill (v0.1.0) — parallel independent-agent dispatch with dialectical synthesis; the independence-wager sibling of `reasoning-framework` (which instead runs lenses as simultaneous recursive feedback in one context). For multi-stakeholder or organization-scale decisions where the cost of independent parallel takes is worth it.
- `docs/installing.md` covering every install target (Claude Code marketplace, single SKILL.md copy, OpenAI custom GPTs, portable format).
- CI step that validates every emitted `.claude-plugin/marketplace.json#plugins[*]` against `spec/marketplace-entry.schema.json` (previously CI only compiled the schema, so emitted/schema drift could slip through).

### Changed
- `reasoning-framework` (v0.2.0 → v0.3.0) — description and body now cross-reference `reasoning-swarm` so multi-team/organization-scale/hard-to-reverse decisions route to the parallel-dispatch sibling instead of matching `reasoning-framework`'s broader "multi-actor system" trigger.
- `README.md` — added a Skills catalog table (both shipped skills, versions, trigger summaries) and fixed the stale "first shipping skill" status line now that two skills ship.

### Changed (breaking — marketplace layout)
- Marketplace name is now `ravenoak-llm-skills` (was `llm-skills`); install command is `/plugin install <skill>@ravenoak-llm-skills`.
- Marketplace + plugin manifests moved to `.claude-plugin/` (`.claude-plugin/marketplace.json` and `plugins/<id>/.claude-plugin/plugin.json`); previously these lived at the repo root. Without this, `/plugin marketplace add` failed with `Marketplace file not found`.
- Source directory renamed `skills/` → `plugins/`. Each `plugins/<id>/` is now a standalone Claude Code plugin with its own manifest.
- Each skill ships as its own installable plugin; the prior single-bundle plugin model is gone. SKILL.md now lives at `plugins/<id>/skills/<id>/SKILL.md` (the nested layout Claude Code auto-discovers).
- Root `plugin.json` removed (the repo is a marketplace, not also a plugin).
- `spec/marketplace-entry.schema.json` updated to match the actual emitted shape (object `author`, `homepage`, `repository`, `license`, `keywords`); the unused legacy `tags` field has been dropped.

### Fixed
- `validate` › `security` had been red on `main` since 2026-08-11. `npm audit` failed on `fast-uri` (via `ajv`); `npm audit fix` moves it to 3.1.9, and also fixes `vitest`, `postcss`, `nanoid`, `brace-expansion` and `esbuild` advisories in the dev tree. That job then reaches `pip-audit`, so `anyio`, `certifi`, `pip` and `urllib3` are upgraded in `tools/py/uv.lock`.
- The deliberate fake `AKIA…` fixture no longer fails the full-repo Semgrep scan (`.semgrepignore`).
- Weekly `audit` workflow failed at setup because `google/osv-scanner-action@v1` no longer resolves. It now uses `osv-scanner-action/osv-scanner-action@v2.7.0`, and passes the issue action one combined report file (it accepts a single path).
- Dependabot ignores `typescript` 7+ until `typescript-eslint` supports it (its peer range is `<6.1`).
- `pip-audit --strict` in CI was failing on every PR because the project's own `llm-skills` Python package isn't published to PyPI. Switched to `--skip-editable` (validate + audit workflows); real vulnerabilities in dependencies still surface.
- `tools/ts/tsconfig.json` now sets `types: ["node"]` explicitly. Vite 8 / vitest 4 stopped emitting the triple-slash references TS 6 was relying on for automatic `@types/node` discovery, which broke every `import "node:..."`.

### Known issues (carried forward)
- The `openai-gpt` and `portable` build targets emit artifacts under `dist/` but have not been independently confirmed against a real OpenAI custom GPT or a downstream portable-format consumer. Mark as **untested** in docs.

### Dependency bumps
- GitHub Actions: `setup-uv` 3→7, `action-gh-release` 2→3, `setup-node` 4→6, `create-issue-from-file` 5→6, `checkout` 4→6.
- npm: `@types/node` 24→25, `commander` 12→14, `typescript` 5→6, `vitest` 2→4, `eslint` 9→10.
