# Installing and using llm-skills

`llm-skills` is a multi-format registry. The same source skill compiles to several runtimes, and how you install it depends on which runtime you're using. This page covers all supported install paths.

The repository lives at <https://github.com/ravenoak/llm-skills>. The Claude Code marketplace is namespaced as **`ravenoak-llm-skills`** to avoid collisions with marketplaces of the same short name.

## Claude Code (marketplace, recommended)

Every skill ships as its own Claude Code plugin under `plugins/<id>/`, with its own `version`. Skills release on independent cadences — installing one does not pin the others — and the repo's `.claude-plugin/marketplace.json` lists each one separately. Pick what you want.

```text
/plugin marketplace add ravenoak/llm-skills
/plugin install reasoning-framework@ravenoak-llm-skills
```

To install everything in the marketplace, run `/plugin install` for each one. (There is intentionally no meta-bundle plugin: it makes the install surface ambiguous, and the per-plugin pattern matches every Anthropic-shipped marketplace.)

To list and update later:

```text
/plugin marketplace list
/plugin marketplace update ravenoak-llm-skills
/plugin install <skill>@ravenoak-llm-skills
```

You can also add the marketplace by Git URL or local checkout:

```text
/plugin marketplace add https://github.com/ravenoak/llm-skills
/plugin marketplace add /path/to/local/clone
```

## Claude Code (single SKILL.md, no plugin)

If you only want one skill and don't want to install a plugin, copy that skill's committed `SKILL.md` into your project's or user-wide skills directory:

```bash
# Per-project
mkdir -p .claude/skills/reasoning-framework
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/plugins/reasoning-framework/skills/reasoning-framework/SKILL.md \
  -o .claude/skills/reasoning-framework/SKILL.md

# Or user-wide
mkdir -p ~/.claude/skills/reasoning-framework
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/plugins/reasoning-framework/skills/reasoning-framework/SKILL.md \
  -o ~/.claude/skills/reasoning-framework/SKILL.md
```

Claude Code auto-discovers skills in those locations on next session start.

## OpenAI custom GPTs / Apps (untested)

> **Status:** artifacts are emitted by the build but have not been independently confirmed against the live OpenAI GPT builder. Treat the steps below as the intended flow, not a verified path. If you try it, please open an issue with what worked and what didn't.

For each skill that opts into the `openai-gpt` target, the build produces a bundle under `dist/openai/<id>/`:

- `manifest.json` — name, description, conversation starters, capabilities
- `instructions.md` — the system prompt body

To use these:

1. Download the release bundle (`openai-bundle.tar.gz`) from the GitHub Releases page, or build locally with `task build` and read from `dist/openai/<id>/`.
2. Create a new custom GPT (or App) in the OpenAI dashboard.
3. Paste `instructions.md` into the **Instructions** field.
4. Copy `name`, `description`, and `conversationStarters` from `manifest.json` into the matching fields.
5. If the skill ships an `actionsSchema`, paste it into the **Actions** configuration.

## Portable format (untested)

> **Status:** the artifact is emitted and validates against `spec/skill.schema.json`, but no external consumer has yet exercised it. Schema-validity is necessary, not sufficient.

The vendor-neutral portable artifact lives at `dist/portable/<id>/skill.json`. It is intended for downstream tools that want a single canonical source.

```bash
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/dist/portable/reasoning-framework/skill.json \
  -o reasoning-framework.skill.json
```

Consumers may translate this into their own runtime format; the schema is stable within a major version.

## Verifying an install

- **Claude Code skill:** start a new session and ask a question that matches the skill's trigger phrase. Claude announces skills it invokes ("Using `reasoning-framework` to …").
- **Claude Code marketplace:** `/plugin marketplace list` shows `ravenoak-llm-skills` and `/plugin list` shows installed skills.
- **OpenAI GPT:** the configured conversation starters appear on the GPT's landing screen.

## Updating

- Marketplace: `/plugin marketplace update ravenoak-llm-skills` then `/plugin install <skill>@ravenoak-llm-skills` to pick up the new version.
- Direct `SKILL.md` copy: re-download from `main` (or a tag) and overwrite the local file.
- OpenAI GPT: download the new release bundle and re-paste the changed sections.

Releases are tagged `v*.*.*`; the latest tag is the source of truth.

## Uninstalling

- Claude Code: `/plugin uninstall <skill>@ravenoak-llm-skills`, then optionally `/plugin marketplace remove ravenoak-llm-skills`.
- Direct copy: delete the relevant `SKILL.md` (or its parent directory) from your skills folder.
- OpenAI GPT: delete or unpublish the GPT from the OpenAI dashboard.
