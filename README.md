# llm-skills

A multi-format LLM skills marketplace. One portable source compiles to Claude Code Skills, Claude Code Plugins, OpenAI GPTs/Apps, and a vendor-neutral portable format.

## Status

Pre-release. No shipping skills yet — the repo currently ships the spec and tooling.

## Install (Claude Code)

Add this repo to your Claude Code marketplaces and install via `/plugin`. Releases are tagged `v*.*.*`; the latest tag is the source of truth.

## Local development

```bash
brew install go-task        # or: go install github.com/go-task/task/v3/cmd/task@latest
task setup                  # installs Node + Python tooling
task check                  # runs CI gate locally
```

## Layout

- `spec/` — the canonical portable skill format (JSON Schema)
- `skills/<id>/` — per-skill source + committed Claude artifacts
- `tools/ts/` — `skillsmith` CLI (npm)
- `tools/py/` — `llm-skills` CLI (PyPI)
- `dist/` — build outputs for OpenAI and portable targets (gitignored)

See `docs/superpowers/specs/2026-05-21-llm-skills-host-design.md` for the design.

## License

MIT — see [`LICENSE`](./LICENSE).
