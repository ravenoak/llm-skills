# llm-skills

A multi-format LLM skills marketplace. One portable source compiles to Claude Code Skills, Claude Code Plugins, OpenAI GPTs/Apps, and a vendor-neutral portable format.

Repository: <https://github.com/ravenoak/llm-skills>

## Status

Early release. The first shipping skill is [`reasoning-framework`](./plugins/reasoning-framework); more skills will land against the same spec and pipeline.

## Install

The same source compiles to several runtimes — pick the path that matches yours. Full instructions for every target are in [`docs/installing.md`](./docs/installing.md).

### Claude Code (marketplace, recommended)

In an interactive Claude Code session:

```text
/plugin marketplace add ravenoak/llm-skills
/plugin install reasoning-framework@ravenoak-llm-skills
```

Each skill is its own installable plugin — pick the ones you want, no all-or-nothing bundle. `/plugin marketplace update ravenoak-llm-skills` picks up new releases. Releases are tagged `v*.*.*`; the latest tag is the source of truth.

### Claude Code (single SKILL.md, no plugin)

Drop the committed `SKILL.md` into your project's or user-wide skills directory:

```bash
mkdir -p ~/.claude/skills/reasoning-framework
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/plugins/reasoning-framework/skills/reasoning-framework/SKILL.md \
  -o ~/.claude/skills/reasoning-framework/SKILL.md
```

### OpenAI custom GPTs / Apps

For each skill that opts into the `openai-gpt` target, `dist/openai/<id>/` ships a `manifest.json` and `instructions.md`. Paste them into a custom GPT's configuration. See [`docs/installing.md`](./docs/installing.md#openai-custom-gpts--apps).

### Portable format

The vendor-neutral artifact lives at `dist/portable/<id>/skill.json`; it validates against `spec/skill.schema.json`.

## Using a skill

Once installed, the skill activates from its `description` (the trigger phrase Claude reads). Each skill's `SKILL.md` documents what it's for, when to use it, and when to skip it. For example, `reasoning-framework` activates when stress-testing a conclusion or auditing a complex claim, and is meant to be skipped for time-pressured decisions or mechanical lookups.

## Local development

```bash
brew install go-task        # or: go install github.com/go-task/task/v3/cmd/task@latest
task setup                  # installs Node + Python tooling
task check                  # runs CI gate locally
```

## Layout

- `spec/` — the canonical portable skill format (JSON Schema)
- `plugins/<id>/` — per-skill plugin source + committed Claude artifacts (each is a standalone Claude Code plugin)
- `tools/ts/` — `skillsmith` CLI (npm)
- `tools/py/` — `llm-skills` CLI (PyPI)
- `dist/` — build outputs for OpenAI and portable targets (gitignored)

## Documentation

- [`docs/installing.md`](./docs/installing.md) — install and update instructions for every target
- [`docs/authoring.md`](./docs/authoring.md) — write a new skill
- [`docs/targets/`](./docs/targets) — per-target build details (Claude skill, Claude plugin, OpenAI GPT)
- [`docs/governance.md`](./docs/governance.md) — release and contribution policy
- [`docs/superpowers/specs/2026-05-21-llm-skills-host-design.md`](./docs/superpowers/specs/2026-05-21-llm-skills-host-design.md) — original design spec

## License

MIT — see [`LICENSE`](./LICENSE).
