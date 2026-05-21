# Skill spec

The canonical portable format. `spec/skill.schema.json` is the contract every `skills/<id>/skill.json` must satisfy.

## At a glance

- `specVersion` is currently `"1"`. Breaking changes bump to `"2"` and trigger a major release.
- `body` is always a file reference (path or template). Inline bodies are forbidden.
- `targets` is opt-in: a skill emits only to targets it declares.
- `overrides` replace the whole body for a single target; no patch syntax.

See `docs/superpowers/specs/2026-05-21-llm-skills-host-design.md` §5 for the full design rationale.

## Validating a manifest locally

```bash
npx --yes ajv-cli@5 validate \
  -s spec/skill.schema.json \
  --spec=draft2020 \
  --validate-formats=false \
  -d skills/<id>/skill.json
```

`skillsmith validate` runs this plus additional structural checks (id matches dir, file refs resolve, SPDX license valid).
