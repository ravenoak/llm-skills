# Contributing

Thanks for your interest in `llm-skills`!

## Prerequisites

- Node 24+
- Python 3.13+
- [go-task](https://taskfile.dev): `brew install go-task` or `go install github.com/go-task/task/v3/cmd/task@latest`

## Setup

```bash
git clone https://github.com/ravenoak/llm-skills
cd llm-skills
task setup
```

## Authoring a new skill

```bash
npx --prefix tools/ts skillsmith new my-skill
# edit skills/my-skill/skill.json and skills/my-skill/body.md
task check                  # validates, lints, builds; fails if Claude artifacts drift
git add skills/my-skill
git commit -m "feat(my-skill): add my-skill"
```

## What CI checks

- Schema validation of every `skill.json`
- Prose lint (`skillsmith lint`)
- Build cleanliness (`git diff --exit-code` after `skillsmith build`)
- TS and Python unit tests, types, and linters
- `marketplace.json` is regenerated and identical to the committed copy
- Security: Semgrep, npm audit, pip-audit

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`).
- Never edit `marketplace.json` by hand — it is regenerated.
- Body content always lives in a sibling file; never inlined in `skill.json`.
- Overrides are whole-file replacements; no patch syntax.

## PR checklist

Filled in via the PR template. Highlights: target list touched, semver-bump rationale, eval results if applicable.
