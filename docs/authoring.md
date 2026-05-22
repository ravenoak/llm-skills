# Authoring a skill

A skill is a directory under `skills/` containing source files (and, after `task build`, a committed `SKILL.md`).

## Scaffold

```bash
npx --prefix tools/ts skillsmith new my-skill
```

This creates:

```
skills/my-skill/
├── skill.json    # source; validates against spec/skill.schema.json
└── body.md       # canonical body
```

Edit `skill.json` to set a real `description` (this is the trigger phrase Claude reads). Edit `body.md` to write the actual instructions.

## Targets

Each skill opts in to the targets it supports via the `targets` block. The scaffold turns on `claude-skill`, `claude-plugin`, and `portable`; `openai-gpt` is off by default.

## Overrides

If a target needs a different body, drop a file at `skills/my-skill/overrides/<target>.md` and reference it in `skill.json#overrides`:

```jsonc
"overrides": {
  "openai-gpt": { "path": "overrides/openai-gpt.md" }
}
```

Overrides are whole-file replacements. No patch syntax.

## Build and commit

```bash
task check       # validate + lint + build + git-clean
git add skills/my-skill
git commit -m "feat(my-skill): add my-skill"
```

The `task check` step ensures the committed `SKILL.md` matches what the builder would produce. CI will fail PRs where these drift.
