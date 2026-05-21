# llm-skills (Python CLI)

Evaluate, draft, and score skills authored in the `llm-skills` portable format.

## Install

```bash
uv sync
uv run llm-skills --help
```

## Commands

- `llm-skills eval <skill|--all>` — run examples through Claude or OpenAI with prompt caching enabled.
- `llm-skills draft <topic>` — LLM-assisted draft of `skill.json` + `body.md`.
- `llm-skills score <skill>` — static heuristics on description quality.
