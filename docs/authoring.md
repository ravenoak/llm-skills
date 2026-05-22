# Authoring a skill

A skill is a directory under `plugins/` that doubles as a standalone Claude Code plugin. It contains source files (and, after `task build`, committed Claude Code artifacts).

## Scaffold

```bash
npx --prefix tools/ts skillsmith new my-skill
```

This creates:

```
plugins/my-skill/
├── skill.json    # source; validates against spec/skill.schema.json
└── body.md       # canonical body
```

Edit `skill.json` to set a real `description` (this is the trigger phrase Claude reads). Edit `body.md` to write the actual instructions.

## Targets

Each skill opts in to the targets it supports via the `targets` block. The scaffold turns on `claude-skill`, `claude-plugin`, and `portable`; `openai-gpt` is off by default.

## Overrides

If a target needs a different body, drop a file at `plugins/my-skill/overrides/<target>.md` and reference it in `skill.json#overrides`:

```jsonc
"overrides": {
  "openai-gpt": { "path": "overrides/openai-gpt.md" }
}
```

Overrides are whole-file replacements. No patch syntax.

## Build and commit

```bash
task check       # validate + lint + build + git-clean
git add plugins/my-skill
git commit -m "feat(my-skill): add my-skill"
```

`task check` runs the builder and asserts that the committed Claude artifacts under `plugins/my-skill/` (`.claude-plugin/plugin.json` and `skills/my-skill/SKILL.md`) match what the builder would produce, and that the root `.claude-plugin/marketplace.json` lists the new plugin. CI will fail PRs where any of these drift.
