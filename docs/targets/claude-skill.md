# Target: claude-skill

Emits `skills/<id>/SKILL.md` with YAML frontmatter:

| Source | Frontmatter field |
|---|---|
| `skill.json#id` | `name` |
| `skill.json#description` (clipped to 1024) | `description` |
| `skill.json#targets.claude-skill.allowedTools` | `allowed-tools` |
| `skill.json#targets.claude-skill.model` | `model` |

The body of `SKILL.md` is `body.md` (or `overrides/claude-skill.md` if present).

This artifact is committed alongside the source so the repo is directly installable.
