# llm-skills — Multi-format LLM Skills Marketplace

> **Historical design document.** Captures the original proposal from 2026-05-21. The shipped implementation has diverged in several places — most notably the repo is now a *marketplace of per-skill plugins* (`.claude-plugin/marketplace.json` lists one entry per skill at `./plugins/<id>`), not a single root-level Claude Code plugin; source files live under `plugins/<id>/` rather than `skills/<id>/`; and there is no root `plugin.json`. For the current shape, see [`docs/installing.md`](../../installing.md), [`docs/authoring.md`](../../authoring.md), [`docs/targets/claude-plugin.md`](../../targets/claude-plugin.md), and [`CHANGELOG.md`](../../../CHANGELOG.md). This doc is preserved for design-history reasons.

**Status:** Approved design, ready for implementation planning
**Date:** 2026-05-21
**Author:** @ravenoak
**Spec location:** `docs/superpowers/specs/2026-05-21-llm-skills-host-design.md`

## 1. Purpose

`llm-skills` is a public, polyglot monorepo that authors, validates, builds, and distributes **LLM skills** across multiple host platforms from a single portable source-of-truth. Targets in scope at launch:

- **Claude Code Skills** (`SKILL.md` with YAML frontmatter)
- **Claude Code Plugins** (full plugin bundles published via `marketplace.json`)
- **OpenAI / ChatGPT custom GPTs / Apps** (GPT manifests + instructions)
- **Portable / vendor-neutral** distribution (canonical bundles consumable by any future host)

The repo is itself a Claude Code plugin (root `plugin.json` + committed `SKILL.md` artifacts), so `claude plugin install` from a tag works without a build step. Other targets ship as release artifacts.

## 2. Goals and non-goals

### Goals
- One JSON-Schema-defined source of truth per skill; multiple compiled outputs per release.
- Strong validation: schema check, prose lint, build-clean check enforced in CI.
- Public marketplace: versioned releases, `marketplace.json`, npm + PyPI publishing.
- Polyglot tooling that picks the right runtime per job (TS for build, Python for eval/draft).
- Author ergonomics: `skillsmith new` scaffolds, `task check` mirrors CI, drift fails PRs.

### Non-goals
- Cross-target patch/insert overrides — overrides are **whole-file body replacements** only.
- A shared core library between TS and Python tools — schema sharing is sufficient.
- Auto-commit bots that regenerate artifacts — contributors run `task build` themselves; CI gates drift.
- A custom DSL or runtime — skills are content, not executable code.

## 3. High-level architecture

Three logical layers:

1. **`spec/`** — canonical portable format. JSON Schema (Draft 2020-12) defines manifests. Versioned independently of content via `specVersion`.
2. **`skills/<skill-id>/`** — source-of-truth content. Each skill is a directory containing source files (`skill.json`, `body.md`, optional `overrides/`) **and** built-and-committed Claude Code artifacts (`SKILL.md`). Drift between source and committed artifact fails CI.
3. **`dist/`** (gitignored) — build outputs for non-Claude targets: `dist/openai/`, `dist/portable/`. Generated fresh per release.

Tooling lives in two independent packages:

- **`tools/ts/`** — `skillsmith` CLI (Node 24, TypeScript), owns validation, build, marketplace assembly, and the CI drift gate. Published to npm.
- **`tools/py/`** — `llm-skills` CLI (Python 3.13), owns evals, LLM-assisted drafting, and prose-quality scoring. Published to PyPI.

Top-level `Taskfile.yml` (go-task) orchestrates the two packages.

## 4. Repository layout

```
llm-skills/
├── README.md
├── LICENSE                           # MIT
├── CONTRIBUTING.md
├── CODEOWNERS                        # * @ravenoak
├── CHANGELOG.md                      # keep-a-changelog
├── SECURITY.md                       # private vuln reporting, 90-day disclosure
├── .editorconfig
├── .gitignore                        # dist/, node_modules/, .venv/, __pycache__/, *.tsbuildinfo
├── .gitattributes
├── Taskfile.yml                      # task setup / validate / build / eval / check / clean
│
├── plugin.json                       # root is itself a Claude Code plugin
├── marketplace.json                  # generated, never hand-edited
│
├── spec/
│   ├── skill.schema.json             # Draft 2020-12, $id pinned, includes specVersion
│   ├── marketplace-entry.schema.json
│   ├── README.md                     # human-readable spec walkthrough
│   └── examples/
│       └── minimal-skill/            # test fixture, not a shipping skill
│
├── skills/
│   └── <skill-id>/
│       ├── skill.json                # source, validated against spec/skill.schema.json
│       ├── body.md                   # canonical body
│       ├── SKILL.md                  # BUILT and COMMITTED Claude artifact
│       └── overrides/                # optional per-target whole-file replacements
│           ├── claude-skill.md
│           ├── claude-plugin/
│           ├── openai-gpt.md
│           └── portable.md
│
├── commands/                         # composed from skills/*/overrides/claude-plugin/commands
├── agents/                           # composed similarly
├── hooks/                            # composed similarly
│
├── tools/
│   ├── ts/                           # skillsmith
│   │   ├── package.json              # engines.node >= 24
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── validate.ts
│   │   │   ├── lint.ts
│   │   │   ├── compile/
│   │   │   │   ├── claude-skill.ts
│   │   │   │   ├── claude-plugin.ts
│   │   │   │   ├── openai.ts
│   │   │   │   └── portable.ts
│   │   │   ├── marketplace.ts
│   │   │   └── check.ts
│   │   └── test/                     # vitest
│   └── py/                           # llm-skills
│       ├── pyproject.toml            # requires-python = ">=3.13"
│       ├── src/llm_skills/
│       │   ├── cli.py
│       │   ├── eval.py
│       │   ├── draft.py
│       │   └── score.py
│       └── tests/                    # pytest
│
├── dist/                             # gitignored, OpenAI + portable outputs only
│
├── docs/
│   ├── superpowers/specs/
│   │   └── 2026-05-21-llm-skills-host-design.md   # this document
│   ├── authoring.md
│   ├── targets/
│   │   ├── claude-skill.md
│   │   ├── claude-plugin.md
│   │   └── openai.md
│   └── governance.md
│
└── .github/
    ├── workflows/
    │   ├── validate.yml
    │   ├── release.yml
    │   └── audit.yml
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── dependabot.yml
```

## 5. Portable skill manifest schema

`spec/skill.schema.json` is JSON Schema **Draft 2020-12**, with `$id`:

```
https://github.com/ravenoak/llm-skills/spec/skill.schema.json
```

### Top-level shape

| Field | Type | Required | Notes |
|---|---|---|---|
| `specVersion` | `"1"` | yes | Bumped on breaking schema change. |
| `id` | string `^[a-z][a-z0-9-]{1,63}$` | yes | Must match directory name. |
| `version` | semver string | yes | Per-skill semver. |
| `name` | string (1–80) | yes | Human-readable title. |
| `description` | string (10–1024) | yes | Triggering text; clipped to per-target limit at build. |
| `tags` | string[] (unique) | no | |
| `license` | SPDX id | no | Defaults to repo `LICENSE` (MIT). |
| `authors` | `{name, url?}[]` | no | |
| `body` | `bodyRef` | yes | Always a file reference, never inlined. |
| `inputs` | `input[]` | no | Declared parameters. |
| `examples` | `example[]` | no | Consumed by Python eval CLI; not emitted as content. |
| `targets` | object | no | Opt-in per-target enablement and config. |
| `overrides` | `{<target>: bodyRef}` | no | Whole-file body replacement per target. |

### `bodyRef`
```jsonc
// Either a direct path or a templated file.
{ "path": "body.md" }
{ "template": "body.md.tmpl", "vars": { "tool": "Claude" } }
```
Inlining body content is forbidden; body always lives in a sibling file. Keeps `skill.json` reviewable and prose markdown-friendly.

### `targets`
Opt-in. A skill emits to a target only if that key is present.

```jsonc
"targets": {
  "claude-skill":  { "enabled": true, "allowedTools": ["Read","Edit"], "model": "claude-sonnet-4-6" },
  "claude-plugin": { "enabled": true, "category": "developer-tools" },
  "openai-gpt":    { "enabled": true, "conversationStarters": ["..."], "capabilities": ["web_browsing"] },
  "portable":      { "enabled": true }
}
```

### `overrides`
```jsonc
"overrides": {
  "openai-gpt": { "path": "overrides/openai-gpt.md" }
}
```
Whole-file replacements only. No patch/insert/before/after operators — a deliberate simplicity decision; reconsider only if a real skill demonstrates the need.

### Mapping rules (single skill → outputs)

| Source | Builder output |
|---|---|
| `skills/foo/skill.json` | Parsed + validated; metadata flows into each target. |
| `skills/foo/body.md` | SKILL.md body, GPT instructions, portable body — unless overridden. |
| `skills/foo/overrides/openai-gpt.md` | Replaces `body.md` only for the OpenAI target. |
| `skill.json#targets.claude-skill.allowedTools` | `allowed-tools:` frontmatter in built `SKILL.md`. |
| `skill.json#examples` | Read by `llm-skills eval`; not emitted. |

## 6. Tooling

### `skillsmith` (TypeScript, Node 24)

Stack: TypeScript, bundled with `tsup`, validated with Ajv (Draft 2020-12), tested with Vitest. Bundled into a single CLI entry point. Strict TypeScript (`"strict": true`, `"noUncheckedIndexedAccess": true`).

| Command | Behavior |
|---|---|
| `skillsmith validate [skill…]` | Walk `skills/`. For each: validate `skill.json` against schema, verify body/override files exist and non-empty, verify `id` matches directory name, verify SPDX license is recognized. Non-zero on any failure. |
| `skillsmith lint [skill…]` | Prose checks: description starts with a triggering verb-phrase, fits per-target length cap, no `{{…}}` placeholders survived templating, no obvious secrets (heuristic regex for AWS keys, GitHub tokens, etc.). Severities: error / warn / off. |
| `skillsmith build [--target=…]` | Compile selected targets (default: all in each skill's `targets` map). Claude artifacts written **in-place** under `skills/<id>/SKILL.md` and root `commands/`, `agents/`, `hooks/`, `plugin.json`. Other targets to `dist/<target>/<id>/`. |
| `skillsmith check` | CI gate: runs `validate` + `lint` + `build`, then asserts the working tree is clean (`git diff --exit-code`). Drift in committed Claude artifacts fails the gate. |
| `skillsmith marketplace` | Regenerate `marketplace.json` from skills with `targets.claude-plugin.enabled === true` + repo metadata. |
| `skillsmith new <id>` | Scaffold a new skill directory with starter `skill.json` and empty `body.md`. |
| `skillsmith diff <id>` | Show each target's emitted output, useful when tweaking overrides. |

Compilers live under `src/compile/`, one per target, each exporting `compile(skill: ParsedSkill): TargetArtifact[]`. The `claude-plugin` compiler is special: when any skill enables it, the compiler also assembles root-level `plugin.json` and merges `overrides/claude-plugin/{commands,agents,hooks}/` into root dirs, validating against the Claude plugin schema.

`marketplace.json` is **always generated**, never hand-edited. The repo's PR template explicitly calls this out.

### `llm-skills` (Python 3.13)

Stack: `uv` for env + lockfile, `pytest` for tests, `ruff` for lint, `mypy --strict` for typing. Uses the official Anthropic and OpenAI SDKs.

| Command | Behavior |
|---|---|
| `llm-skills eval <skill\|--all> [--target=claude-skill] [--model=claude-sonnet-4-6]` | Load compiled body for a target, run each `examples[]` fixture through the appropriate SDK with prompt caching enabled by default, score with a configurable rubric, write JSON report to `dist/reports/<skill>-<timestamp>.json`. `--all` iterates every skill that declares `examples`. |
| `llm-skills draft <topic>` | LLM-assisted: prompt a model to draft `skill.json` + `body.md` from a topic description into `skills/<id>/` for human refinement. |
| `llm-skills score <skill>` | Static heuristics on description quality: trigger-phrase analysis, ambiguity score, redundancy with other skills' descriptions. No model calls; safe for CI. |

**Boundary:** Python never writes built artifacts or modifies `marketplace.json`. TS owns the build pipeline; Python owns evals and drafting. They share only `spec/skill.schema.json` (read by both, written by neither at runtime).

### `Taskfile.yml`

go-task is a hard dependency for contributors; install via `brew install go-task` or `go install github.com/go-task/task/v3/cmd/task@latest`. README documents both.

Targets:
- `task setup` — `npm ci` in `tools/ts`, `uv sync` in `tools/py`.
- `task validate` — `skillsmith validate`.
- `task build` — `skillsmith build`.
- `task eval` — `llm-skills eval --all` (gated by `LLM_SKILLS_RUN_EVALS=1` so it never runs in default CI).
- `task check` — `validate` + `lint` + `build` + `git diff --exit-code`.
- `task clean` — remove `dist/` and tooling build artifacts.

## 7. CI / CD

### `.github/workflows/validate.yml`
Triggers: PR and push to `main`. Concurrency-cancel on same ref.

Jobs:
- **`ts-check`**: Node 24, `npm ci` in `tools/ts/`, `npm run typecheck`, `npm test`, then `npx skillsmith check` from repo root.
- **`py-check`**: Python 3.13, `uv sync` in `tools/py/`, `ruff check`, `mypy --strict`, `pytest`.
- **`schema-check`**: validates `spec/skill.schema.json` itself against the Draft 2020-12 meta-schema.
- **`security`**: `semgrep --config auto` over `tools/` and `skills/`, `npm audit --omit=dev` in `tools/ts/`, `pip-audit` in `tools/py/`. Production dep findings + skill-content findings are blocking; dev-only warnings are non-blocking.

### `.github/workflows/release.yml`
Triggers: tag push matching `v*.*.*`.

Steps:
1. Re-run `validate` jobs against the tagged commit.
2. `task build` — assemble all targets.
3. Create GitHub Release; attach three tarballs:
   - `claude-plugin.tar.gz` — the committed plugin tree at the tag (`plugin.json` + `skills/*/SKILL.md` + root `commands/`, `agents/`, `hooks/`), for users who want an offline install instead of the marketplace flow.
   - `openai-bundle.tar.gz` — `dist/openai/`.
   - `portable-bundle.tar.gz` — `dist/portable/`.
4. Publish `skillsmith` to npm with `npm publish --provenance` (OIDC; no token storage required).
5. Publish `llm-skills` to PyPI via **Trusted Publishing** (OIDC; no API token stored).
6. CHANGELOG check: refuse to publish if the tag does not match the topmost `[X.Y.Z]` heading in `CHANGELOG.md`.

### `.github/workflows/audit.yml`
Weekly cron. Deeper sweep: `semgrep ci`, `osv-scanner`, `npm audit --audit-level=high`, `pip-audit --strict`. Opens an issue (not a PR) when findings appear.

### Versioning policy
- **Schema**: independent semver; `specVersion` in the schema. Major schema bump = major repo release.
- **Tools**: `skillsmith` and `llm-skills` carry independent semver in their package manifests.
- **Skills**: each skill carries its own `version`.
- **Repo / marketplace**: the latest release tag is the source of truth for `claude plugin install`.

## 8. Contribution and governance

- `CONTRIBUTING.md` walks new authors through: clone → `task setup` → `skillsmith new <id>` → edit → `task check` → commit → PR.
- `CODEOWNERS`: `* @ravenoak` initially; `spec/` and `tools/` lines flagged for extra review when co-maintainers exist.
- PR template asks for: target list, semver-bump rationale, eval results (if applicable), behavior change transcripts.
- Branch protection on `main` (manual GitHub setup, documented in `docs/governance.md`): requires `validate.yml` green, 1 review, signed commits.
- **License**: MIT.
- `SECURITY.md`: private vulnerability reporting via GitHub's "Report a vulnerability"; 90-day disclosure window.

## 9. Trade-offs and explicit rejections

1. **Committed Claude artifacts.** Pro: repo is directly installable. Con: every skill-changing PR must include regenerated `SKILL.md`. Mitigated by `skillsmith check` and the PR template reminder. Considered and rejected: a CI auto-commit bot — more moving parts, confusing for first-time contributors.
2. **No shared TS/Python core library.** Schema sharing is enough at current scale. If duplicated parsing logic grows substantially on both sides (rough heuristic: more than a few hundred lines that have to stay in sync), revisit and extract `@llm-skills/core`.
3. **Whole-file overrides only.** A patch-based override engine is more flexible but every patch syntax we considered was either ugly or surprising. Whole-file replacement is trivial to reason about.
4. **Opt-in `targets`.** A skill emits only to declared targets. Prevents accidentally shipping an unfinished GPT variant.
5. **`marketplace.json` always generated.** Hand-editing is forbidden; the lint catches it.
6. **No monorepo tool** (no Turbo / Nx / uv-workspaces). Two languages, two package managers, one Taskfile. Easier to reason about than a workspace abstraction.

## 10. Out of scope (deferred)

- Example shipping skills. This pass delivers structure + tooling; content lands in follow-up PRs.
- Localization / i18n of skill bodies.
- Cross-skill composition / dependencies between skills.
- Runtime telemetry on skill invocation.
- Hosted web UI for browsing the marketplace.

## 11. Success criteria

This design is implemented successfully when:
1. `task setup && task check` passes on a fresh clone.
2. `skillsmith new demo` produces a skill that, after `skillsmith build`, results in a valid `SKILL.md`, a valid OpenAI bundle, and a valid portable bundle.
3. A tagged release produces a GitHub Release with all three bundles attached and publishes the two CLIs to their registries.
4. Installing the repo as a Claude Code plugin from a release tag (via Claude Code's plugin install flow against `marketplace.json`) succeeds without manual build steps.
5. CI fails a PR that modifies `skills/<id>/body.md` without regenerating `SKILL.md`.
