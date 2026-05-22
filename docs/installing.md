# Installing and using llm-skills

`llm-skills` is a multi-format registry. The same source skill compiles to several runtimes, and how you install it depends on which runtime you're using. This page covers all supported install paths.

The repository lives at <https://github.com/ravenoak/llm-skills>.

## Claude Code (marketplace)

The Claude Code marketplace is the recommended install path. The repo is itself a single Claude Code plugin (`llm-skills`) that bundles every shipping skill; `.claude-plugin/marketplace.json` is the marketplace index that points at the plugin.

In an interactive Claude Code session:

```text
/plugin marketplace add ravenoak/llm-skills
/plugin install llm-skills@llm-skills
```

The plugin is the bundle; individual skills (currently `reasoning-framework`) are auto-discovered from `skills/<id>/SKILL.md` and activate from their own `description` trigger phrase. There is no per-skill install command.

To list and update later:

```text
/plugin marketplace list
/plugin marketplace update llm-skills
/plugin install llm-skills@llm-skills
```

You can also add the marketplace by Git URL or local checkout:

```text
/plugin marketplace add https://github.com/ravenoak/llm-skills
/plugin marketplace add /path/to/local/clone
```

## Claude Code (single SKILL.md, no plugin)

If you only want one skill and don't want to install the plugin, copy that skill's committed `SKILL.md` into your project's or user-wide skills directory:

```bash
# Per-project
mkdir -p .claude/skills/reasoning-framework
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/skills/reasoning-framework/SKILL.md \
  -o .claude/skills/reasoning-framework/SKILL.md

# Or user-wide
mkdir -p ~/.claude/skills/reasoning-framework
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/skills/reasoning-framework/SKILL.md \
  -o ~/.claude/skills/reasoning-framework/SKILL.md
```

Claude Code auto-discovers skills in those locations on next session start.

## OpenAI custom GPTs / Apps

For each skill that opts into the `openai-gpt` target, the build produces a bundle under `dist/openai/<id>/`:

- `manifest.json` — name, description, conversation starters, capabilities
- `instructions.md` — the system prompt body

To use these:

1. Download the release bundle (`openai-bundle.tar.gz`) from the GitHub Releases page, or build locally with `task build` and read from `dist/openai/<id>/`.
2. Create a new custom GPT (or App) in the OpenAI dashboard.
3. Paste `instructions.md` into the **Instructions** field.
4. Copy `name`, `description`, and `conversationStarters` from `manifest.json` into the matching fields.
5. If the skill ships an `actionsSchema`, paste it into the **Actions** configuration.

## Portable format

The vendor-neutral portable artifact lives at `dist/portable/<id>/skill.json`. It validates against `spec/skill.schema.json` and is intended for downstream tools that want a single canonical source.

```bash
curl -L \
  https://raw.githubusercontent.com/ravenoak/llm-skills/main/dist/portable/reasoning-framework/skill.json \
  -o reasoning-framework.skill.json
```

Consumers may translate this into their own runtime format; the schema is stable within a major version.

## Verifying an install

- **Claude Code skill:** start a new session and ask a question that matches the skill's trigger phrase. Claude announces skills it invokes ("Using `reasoning-framework` to …").
- **Claude Code marketplace:** `/plugin marketplace list` shows `llm-skills` and `/plugin list` shows the installed `llm-skills` plugin.
- **OpenAI GPT:** the configured conversation starters appear on the GPT's landing screen.

## Updating

- Marketplace: `/plugin marketplace update llm-skills` then `/plugin install llm-skills@llm-skills` to pick up the new version.
- Direct `SKILL.md` copy: re-download from `main` (or a tag) and overwrite the local file.
- OpenAI GPT: download the new release bundle and re-paste the changed sections.

Releases are tagged `v*.*.*`; the latest tag is the source of truth.

## Uninstalling

- Claude Code: `/plugin uninstall llm-skills@llm-skills`, then optionally `/plugin marketplace remove llm-skills`.
- Direct copy: delete the relevant `SKILL.md` (or its parent directory) from your skills folder.
- OpenAI GPT: delete or unpublish the GPT from the OpenAI dashboard.
