# llm-skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `llm-skills` polyglot monorepo: portable skill schema, `skillsmith` TS CLI, `llm-skills` Python CLI, Taskfile orchestration, CI, and release pipeline. No shipping skills in this pass — only structure and tooling.

**Architecture:** A canonical JSON-Schema-defined skill manifest (`spec/skill.schema.json`) is the source of truth. Each skill is a directory under `skills/` containing source files plus built-and-committed Claude `SKILL.md` artifacts. The TS CLI (`skillsmith`) validates, lints, compiles to four targets (claude-skill, claude-plugin, openai-gpt, portable), assembles `marketplace.json`, and gates drift in CI. The Python CLI (`llm-skills`) handles evals, drafting, and static prose scoring. Both share only the schema file.

**Tech Stack:** TypeScript on Node 24 (`tsup`, `ajv`, `vitest`, `commander`); Python 3.13 (`uv`, `pytest`, `ruff`, `mypy --strict`, `jsonschema`, `anthropic`, `openai`); go-task; GitHub Actions; Semgrep, OSV-Scanner, pip-audit, npm audit.

**Reference spec:** `docs/superpowers/specs/2026-05-21-llm-skills-host-design.md`

---

## Phase 0 — Ground rules for every task

- Every code-producing task follows TDD: write failing test → run (verify fail) → minimal implementation → run (verify pass) → commit. Tasks below show this explicitly; do not skip the failing-test step even when "obvious."
- Commits use Conventional Commits prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`).
- All paths in this plan are relative to the repo root: `/Users/ravenoak/Projects/github.com/ravenoak/llm-skills/`.
- Never edit `marketplace.json` by hand. It is always regenerated.
- Never inline skill body content inside `skill.json`.

---

## Task 1 — Root meta and licensing

**Files:**
- Create: `LICENSE`
- Create: `.editorconfig`
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `README.md`

- [ ] **Step 1: Write LICENSE (MIT)**

Create `LICENSE` containing the standard MIT License text with `Copyright (c) 2026 ravenoak`. Use the canonical SPDX `MIT` text exactly.

- [ ] **Step 2: Write `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.py]
indent_size = 4

[Makefile]
indent_style = tab

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 3: Write `.gitignore`**

```gitignore
# Node / TS
node_modules/
*.tsbuildinfo
tools/ts/dist/

# Python
.venv/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
tools/py/dist/
tools/py/*.egg-info/

# Build outputs (non-Claude targets only — Claude SKILL.md is committed)
/dist/

# Reports
dist/reports/

# OS / editor
.DS_Store
*.swp
.idea/
.vscode/
```

- [ ] **Step 4: Write `.gitattributes`**

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.gz binary
*.tar binary
```

- [ ] **Step 5: Write `README.md` skeleton**

````markdown
# llm-skills

A multi-format LLM skills marketplace. One portable source compiles to Claude Code Skills, Claude Code Plugins, OpenAI GPTs/Apps, and a vendor-neutral portable format.

## Status

Pre-release. No shipping skills yet — the repo currently ships the spec and tooling.

## Install (Claude Code)

Add this repo to your Claude Code marketplaces and install via `/plugin`. Releases are tagged `v*.*.*`; the latest tag is the source of truth.

## Local development

```bash
brew install go-task        # or: go install github.com/go-task/task/v3/cmd/task@latest
task setup                  # installs Node + Python tooling
task check                  # runs CI gate locally
```

## Layout

- `spec/` — the canonical portable skill format (JSON Schema)
- `skills/<id>/` — per-skill source + committed Claude artifacts
- `tools/ts/` — `skillsmith` CLI (npm)
- `tools/py/` — `llm-skills` CLI (PyPI)
- `dist/` — build outputs for OpenAI and portable targets (gitignored)

See `docs/superpowers/specs/2026-05-21-llm-skills-host-design.md` for the design.

## License

MIT — see [`LICENSE`](./LICENSE).
````

- [ ] **Step 6: Commit**

```bash
git add LICENSE .editorconfig .gitignore .gitattributes README.md
git commit -m "chore: scaffold root meta and MIT license"
```

---

## Task 2 — Contribution, security, codeowners, changelog

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `CODEOWNERS`
- Create: `CHANGELOG.md`

- [ ] **Step 1: Write `CONTRIBUTING.md`**

````markdown
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
````

- [ ] **Step 2: Write `SECURITY.md`**

```markdown
# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately via GitHub's "Report a vulnerability" feature on this repository. We aim to acknowledge within 5 business days and disclose within 90 days, coordinating with reporters as needed.

Do not file public issues for suspected vulnerabilities.

## Supported versions

Only the latest tagged release receives security updates.
```

- [ ] **Step 3: Write `CODEOWNERS`**

```
# Default owner for everything
*           @ravenoak

# Extra-careful surfaces
/spec/      @ravenoak
/tools/     @ravenoak
/.github/   @ravenoak
```

- [ ] **Step 4: Write `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository scaffolding, MIT license, contribution and security policies.
```

- [ ] **Step 5: Commit**

```bash
git add CONTRIBUTING.md SECURITY.md CODEOWNERS CHANGELOG.md
git commit -m "docs: add contribution, security, codeowners, changelog"
```

---

## Task 3 — GitHub templates and Dependabot

**Files:**
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/ISSUE_TEMPLATE/skill_proposal.md`
- Create: `.github/dependabot.yml`

- [ ] **Step 1: Write PR template**

```markdown
## Summary

<!-- One paragraph: what changes and why. -->

## Targets touched

- [ ] `claude-skill`
- [ ] `claude-plugin`
- [ ] `openai-gpt`
- [ ] `portable`
- [ ] N/A — tooling / docs only

## Checklist

- [ ] `task check` passes locally
- [ ] Committed Claude artifacts regenerated (no drift)
- [ ] `marketplace.json` regenerated (if a `claude-plugin` skill was added/removed)
- [ ] Semver bump rationale stated (if a skill version changed): _patch / minor / major because…_
- [ ] Eval results attached (if applicable): `dist/reports/<skill>-*.json` excerpt
- [ ] CHANGELOG.md updated under `[Unreleased]`

## Notes for reviewers
```

- [ ] **Step 2: Write bug report template**

```markdown
---
name: Bug report
about: Something is broken
labels: bug
---

**What happened**

**What I expected**

**Reproduction**

1.
2.
3.

**Environment**

- OS:
- Node version:
- Python version:
- skillsmith version:
- llm-skills version:
```

- [ ] **Step 3: Write feature request template**

```markdown
---
name: Feature request
about: Suggest tooling, schema, or workflow improvements
labels: enhancement
---

**Problem**

**Proposed solution**

**Alternatives considered**

**Scope**: schema / TS tooling / Python tooling / CI / docs
```

- [ ] **Step 4: Write skill proposal template**

```markdown
---
name: Skill proposal
about: Propose a new skill for this marketplace
labels: skill-proposal
---

**Skill id (kebab-case)**

**One-line description (the trigger)**

**Targets you intend to publish to**: claude-skill / claude-plugin / openai-gpt / portable

**Why this is worth shipping**

**Example invocations / fixtures you'd add to `examples[]`**
```

- [ ] **Step 5: Write `dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /tools/ts
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
  - package-ecosystem: pip
    directory: /tools/py
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
```

- [ ] **Step 6: Commit**

```bash
git add .github
git commit -m "ci: add PR/issue templates and Dependabot config"
```

---

## Task 4 — Spec: skill JSON Schema

**Files:**
- Create: `spec/skill.schema.json`
- Create: `spec/marketplace-entry.schema.json`
- Create: `spec/README.md`
- Create: `spec/examples/minimal-skill/skill.json`
- Create: `spec/examples/minimal-skill/body.md`

We validate the spec against the Draft 2020-12 meta-schema *before* writing any tooling, so the tooling has a known-good schema to consume.

- [ ] **Step 1: Write the failing meta-schema check**

Create a temporary fixture-validation step. We don't have a TS test framework yet, so we use `npx ajv-cli@5` directly. Add a stub test runner script `spec/.verify.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npx --yes ajv-cli@5 compile -s skill.schema.json --spec=draft2020
npx --yes ajv-cli@5 compile -s marketplace-entry.schema.json --spec=draft2020
npx --yes ajv-cli@5 validate -s skill.schema.json --spec=draft2020 -d examples/minimal-skill/skill.json
echo "spec: ok"
```

`chmod +x spec/.verify.sh`. Run it now (it should fail — the files don't exist):

```bash
./spec/.verify.sh
# Expected: failure — files missing
```

- [ ] **Step 2: Write `spec/skill.schema.json`**

```json
{
  "$id": "https://github.com/ravenoak/llm-skills/spec/skill.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "llm-skills portable skill manifest",
  "type": "object",
  "required": ["specVersion", "id", "version", "name", "description", "body"],
  "additionalProperties": false,
  "properties": {
    "specVersion": { "const": "1" },
    "id":          { "type": "string", "pattern": "^[a-z][a-z0-9-]{1,63}$" },
    "version":     { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+(-[A-Za-z0-9.-]+)?$" },
    "name":        { "type": "string", "minLength": 1, "maxLength": 80 },
    "description": { "type": "string", "minLength": 10, "maxLength": 1024 },
    "tags":        { "type": "array",  "items": { "type": "string" }, "uniqueItems": true },
    "license":     { "type": "string" },
    "authors": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name"],
        "additionalProperties": false,
        "properties": {
          "name": { "type": "string" },
          "url":  { "type": "string", "format": "uri" }
        }
      }
    },
    "body":     { "$ref": "#/$defs/bodyRef" },
    "inputs":   { "type": "array", "items": { "$ref": "#/$defs/input" } },
    "examples": { "type": "array", "items": { "$ref": "#/$defs/example" } },
    "targets": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "claude-skill":  { "$ref": "#/$defs/claudeSkillTarget" },
        "claude-plugin": { "$ref": "#/$defs/claudePluginTarget" },
        "openai-gpt":    { "$ref": "#/$defs/openaiTarget" },
        "portable":      { "$ref": "#/$defs/portableTarget" }
      }
    },
    "overrides": {
      "type": "object",
      "additionalProperties": { "$ref": "#/$defs/bodyRef" },
      "propertyNames": { "enum": ["claude-skill", "claude-plugin", "openai-gpt", "portable"] }
    }
  },
  "$defs": {
    "bodyRef": {
      "type": "object",
      "additionalProperties": false,
      "oneOf": [
        {
          "required": ["path"],
          "properties": { "path": { "type": "string", "minLength": 1 } }
        },
        {
          "required": ["template"],
          "properties": {
            "template": { "type": "string", "minLength": 1 },
            "vars":     { "type": "object" }
          }
        }
      ]
    },
    "input": {
      "type": "object",
      "required": ["name", "type"],
      "additionalProperties": false,
      "properties": {
        "name":        { "type": "string", "pattern": "^[A-Za-z_][A-Za-z0-9_]*$" },
        "type":        { "enum": ["string", "number", "boolean", "object", "array"] },
        "description": { "type": "string" },
        "required":    { "type": "boolean", "default": false },
        "default":     {}
      }
    },
    "example": {
      "type": "object",
      "required": ["input", "expectedBehavior"],
      "additionalProperties": false,
      "properties": {
        "input":            { "type": "string", "minLength": 1 },
        "expectedBehavior": { "type": "string", "minLength": 1 },
        "rubric":           { "type": "object" }
      }
    },
    "claudeSkillTarget": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled":      { "type": "boolean", "default": true },
        "allowedTools": { "type": "array", "items": { "type": "string" } },
        "model":        { "type": "string" }
      }
    },
    "claudePluginTarget": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled":  { "type": "boolean", "default": true },
        "category": { "type": "string" }
      }
    },
    "openaiTarget": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled":              { "type": "boolean", "default": true },
        "conversationStarters": { "type": "array", "items": { "type": "string" } },
        "capabilities":         { "type": "array", "items": { "enum": ["web_browsing", "code_interpreter", "dalle"] } },
        "actionsSchema":        { "type": "string" }
      }
    },
    "portableTarget": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "enabled": { "type": "boolean", "default": true }
      }
    }
  }
}
```

- [ ] **Step 3: Write `spec/marketplace-entry.schema.json`**

```json
{
  "$id": "https://github.com/ravenoak/llm-skills/spec/marketplace-entry.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "marketplace.json entry",
  "type": "object",
  "required": ["name", "source", "description", "version"],
  "additionalProperties": false,
  "properties": {
    "name":        { "type": "string", "pattern": "^[a-z][a-z0-9-]{1,63}$" },
    "source":      { "type": "string", "minLength": 1 },
    "description": { "type": "string", "minLength": 10, "maxLength": 1024 },
    "version":     { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+(-[A-Za-z0-9.-]+)?$" },
    "category":    { "type": "string" },
    "tags":        { "type": "array", "items": { "type": "string" } }
  }
}
```

- [ ] **Step 4: Write the minimal example fixture**

`spec/examples/minimal-skill/skill.json`:

```json
{
  "specVersion": "1",
  "id": "minimal-skill",
  "version": "0.0.1",
  "name": "Minimal Skill",
  "description": "Use when verifying that the llm-skills toolchain parses and validates the smallest valid manifest end-to-end.",
  "body": { "path": "body.md" }
}
```

`spec/examples/minimal-skill/body.md`:

```markdown
# Minimal Skill

This is a fixture used by the test suite. It does nothing useful at runtime.
```

- [ ] **Step 5: Re-run the meta-schema check**

```bash
./spec/.verify.sh
# Expected: "spec: ok"
```

- [ ] **Step 6: Write `spec/README.md`**

````markdown
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
  -d skills/<id>/skill.json
```

`skillsmith validate` runs this plus additional structural checks (id matches dir, file refs resolve, SPDX license valid).
````

- [ ] **Step 7: Commit**

```bash
git add spec/
git commit -m "feat(spec): add skill and marketplace JSON schemas"
```

---

## Task 5 — TS package bootstrap (`skillsmith`)

**Files:**
- Create: `tools/ts/package.json`
- Create: `tools/ts/tsconfig.json`
- Create: `tools/ts/tsup.config.ts`
- Create: `tools/ts/vitest.config.ts`
- Create: `tools/ts/.eslintrc.cjs`
- Create: `tools/ts/src/cli.ts` (stub)
- Create: `tools/ts/test/smoke.test.ts`

- [ ] **Step 1: Write `tools/ts/package.json`**

```json
{
  "name": "skillsmith",
  "version": "0.1.0",
  "description": "Build, validate, and publish llm-skills from a portable source format.",
  "license": "MIT",
  "type": "module",
  "engines": { "node": ">=24" },
  "bin": { "skillsmith": "./dist/cli.js" },
  "files": ["dist", "README.md", "../../spec/skill.schema.json", "../../spec/marketplace-entry.schema.json"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src test --ext .ts",
    "prepublishOnly": "npm run typecheck && npm run lint && npm test && npm run build"
  },
  "dependencies": {
    "ajv": "^8.17.0",
    "ajv-formats": "^3.0.1",
    "commander": "^12.1.0",
    "gray-matter": "^4.0.3",
    "spdx-license-ids": "^3.0.20"
  },
  "devDependencies": {
    "@types/node": "^22.5.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Write `tools/ts/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "lib": ["ES2023"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": false,
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

- [ ] **Step 3: Write `tools/ts/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node24",
  clean: true,
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node" }
});
```

- [ ] **Step 4: Write `tools/ts/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: { provider: "v8", reporter: ["text"] }
  }
});
```

- [ ] **Step 5: Write `tools/ts/.eslintrc.cjs`**

```js
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parserOptions: { ecmaVersion: 2023, sourceType: "module" },
  rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] }
};
```

- [ ] **Step 6: Write the failing smoke test**

`tools/ts/test/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { version } from "../src/cli.js";

describe("skillsmith", () => {
  it("exports a semver version string", () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
```

- [ ] **Step 7: Run test (expected fail — cli.ts doesn't exist yet)**

```bash
cd tools/ts
npm install
npm test
# Expected: FAIL — cannot find ../src/cli.js
```

- [ ] **Step 8: Write minimal `tools/ts/src/cli.ts`**

```ts
export const version = "0.1.0";

async function main(): Promise<void> {
  // Real commands added in later tasks.
  console.log(`skillsmith ${version}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
```

- [ ] **Step 9: Run tests again**

```bash
cd tools/ts
npm test
# Expected: PASS
npm run typecheck
# Expected: PASS
```

- [ ] **Step 10: Commit**

```bash
git add tools/ts package-lock.json 2>/dev/null || true
git add tools/ts
git commit -m "feat(ts): bootstrap skillsmith package skeleton"
```

---

## Task 6 — `skillsmith validate` (schema + structural)

**Files:**
- Create: `tools/ts/src/paths.ts`
- Create: `tools/ts/src/schema.ts`
- Create: `tools/ts/src/parse.ts`
- Create: `tools/ts/src/validate.ts`
- Create: `tools/ts/test/validate.test.ts`
- Create: `tools/ts/test/fixtures/skills/good-skill/skill.json`
- Create: `tools/ts/test/fixtures/skills/good-skill/body.md`
- Create: `tools/ts/test/fixtures/skills/bad-id/skill.json`
- Create: `tools/ts/test/fixtures/skills/bad-id/body.md`

- [ ] **Step 1: Write the failing test**

`tools/ts/test/validate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateSkillDir } from "../src/validate.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures", "skills");

describe("validateSkillDir", () => {
  it("accepts a well-formed skill directory", async () => {
    const result = await validateSkillDir(join(fixtures, "good-skill"));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    if (result.ok) {
      expect(result.skill.id).toBe("good-skill");
    }
  });

  it("rejects when skill.id does not match directory name", async () => {
    const result = await validateSkillDir(join(fixtures, "bad-id"));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("id does not match directory name"))).toBe(true);
  });

  it("rejects when the referenced body file is missing", async () => {
    const result = await validateSkillDir(join(fixtures, "good-skill"), {
      // Force-resolve against a non-existent body for this test.
      overrideBodyPath: "missing.md"
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes("missing"))).toBe(true);
  });
});
```

- [ ] **Step 2: Write the fixtures**

`tools/ts/test/fixtures/skills/good-skill/skill.json`:

```json
{
  "specVersion": "1",
  "id": "good-skill",
  "version": "0.1.0",
  "name": "Good Skill",
  "description": "Use when the validator needs a known-good fixture for unit tests.",
  "license": "MIT",
  "body": { "path": "body.md" }
}
```

`tools/ts/test/fixtures/skills/good-skill/body.md`:

```markdown
# Good Skill

Fixture body content.
```

`tools/ts/test/fixtures/skills/bad-id/skill.json`:

```json
{
  "specVersion": "1",
  "id": "mismatched-id",
  "version": "0.1.0",
  "name": "Bad ID",
  "description": "Use when the validator needs a fixture whose id does not match its directory.",
  "body": { "path": "body.md" }
}
```

`tools/ts/test/fixtures/skills/bad-id/body.md`:

```markdown
# Bad ID
```

- [ ] **Step 3: Run test (expected fail)**

```bash
cd tools/ts
npm test
# Expected: FAIL — validate.js missing
```

- [ ] **Step 4: Implement `src/paths.ts`**

```ts
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(here, "..", "..", "..");
export const specDir = resolve(repoRoot, "spec");
export const skillsDir = resolve(repoRoot, "skills");
export const distDir = resolve(repoRoot, "dist");
```

- [ ] **Step 5: Implement `src/schema.ts`**

```ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { specDir } from "./paths.js";

export type AjvValidator = ReturnType<Ajv2020["compile"]>;

let cachedSkillValidator: AjvValidator | null = null;

export async function getSkillValidator(): Promise<AjvValidator> {
  if (cachedSkillValidator) return cachedSkillValidator;
  const schemaText = await readFile(resolve(specDir, "skill.schema.json"), "utf8");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  cachedSkillValidator = ajv.compile(JSON.parse(schemaText));
  return cachedSkillValidator;
}
```

- [ ] **Step 6: Implement `src/parse.ts`**

```ts
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

export interface BodyRef {
  path?: string;
  template?: string;
  vars?: Record<string, unknown>;
}

export interface ParsedSkill {
  dir: string;
  id: string;
  raw: Record<string, unknown>;
  body: BodyRef;
}

export async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function parseSkill(dir: string): Promise<ParsedSkill> {
  const raw = (await readJson(resolve(dir, "skill.json"))) as Record<string, unknown>;
  const id = String(raw.id ?? "");
  const body = (raw.body ?? {}) as BodyRef;
  return { dir, id, raw, body };
}

export function dirName(dir: string): string {
  return basename(dir);
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 7: Implement `src/validate.ts`**

```ts
import { resolve } from "node:path";
import spdxIds from "spdx-license-ids" assert { type: "json" };
import { getSkillValidator } from "./schema.js";
import { dirName, parseSkill, pathExists } from "./parse.js";

const SPDX = new Set(spdxIds as string[]);

export interface ValidationOptions {
  overrideBodyPath?: string;
}

export type ValidationResult =
  | { ok: true; skill: { id: string; dir: string }; errors: [] }
  | { ok: false; errors: string[] };

export async function validateSkillDir(
  dir: string,
  opts: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = [];

  let skill;
  try {
    skill = await parseSkill(dir);
  } catch (e) {
    return { ok: false, errors: [`failed to parse skill.json in ${dir}: ${(e as Error).message}`] };
  }

  const validate = await getSkillValidator();
  if (!validate(skill.raw)) {
    for (const err of validate.errors ?? []) {
      errors.push(`schema: ${err.instancePath || "/"} ${err.message ?? "invalid"}`);
    }
  }

  if (skill.id !== dirName(dir)) {
    errors.push(`id does not match directory name: "${skill.id}" vs "${dirName(dir)}"`);
  }

  const license = (skill.raw.license as string | undefined) ?? "MIT";
  if (!SPDX.has(license)) {
    errors.push(`license "${license}" is not a recognized SPDX identifier`);
  }

  const bodyPath = opts.overrideBodyPath ?? skill.body.path ?? skill.body.template;
  if (bodyPath) {
    const resolved = resolve(dir, bodyPath);
    if (!(await pathExists(resolved))) {
      errors.push(`body file missing: ${bodyPath}`);
    }
  } else {
    errors.push("body must specify either path or template");
  }

  if (errors.length === 0) {
    return { ok: true, skill: { id: skill.id, dir }, errors: [] };
  }
  return { ok: false, errors };
}
```

- [ ] **Step 8: Run tests again**

```bash
cd tools/ts
npm test
# Expected: PASS (3 tests)
npm run typecheck
# Expected: PASS
```

- [ ] **Step 9: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): validate skill manifests against schema and structure"
```

---

## Task 7 — `skillsmith lint` (prose checks)

**Files:**
- Create: `tools/ts/src/lint.ts`
- Create: `tools/ts/test/lint.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { lintDescription, lintBody } from "../src/lint.js";

describe("lintDescription", () => {
  it("flags descriptions that exceed the per-target cap", () => {
    const long = "x".repeat(1025);
    const findings = lintDescription(long, { maxLength: 1024 });
    expect(findings.some(f => f.code === "description-too-long")).toBe(true);
  });

  it("warns when description does not start with a triggering verb", () => {
    const findings = lintDescription("This is a thing.", { maxLength: 1024 });
    expect(findings.some(f => f.code === "description-weak-trigger")).toBe(true);
  });

  it("accepts a strong trigger phrase", () => {
    const findings = lintDescription("Use when refactoring TypeScript files.", { maxLength: 1024 });
    expect(findings.filter(f => f.severity === "error")).toHaveLength(0);
  });
});

describe("lintBody", () => {
  it("flags surviving placeholder tokens", () => {
    const findings = lintBody("Hello {{name}}, welcome.");
    expect(findings.some(f => f.code === "untemplated-placeholder")).toBe(true);
  });

  it("flags obvious AWS access key patterns", () => {
    const findings = lintBody("export AWS_ACCESS_KEY_ID=AKIAABCDEFGHIJKLMNOP");
    expect(findings.some(f => f.code === "possible-secret")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
cd tools/ts
npm test -- lint
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/lint.ts`**

```ts
export type Severity = "error" | "warn";
export interface Finding {
  code: string;
  severity: Severity;
  message: string;
}

const TRIGGER_STARTS = /^(use when|when |for |handles |triggers )/i;
const PLACEHOLDER = /\{\{\s*[A-Za-z0-9_.-]+\s*\}\}/;
const AWS_KEY = /\bAKIA[0-9A-Z]{16}\b/;
const GH_TOKEN = /\bghp_[A-Za-z0-9]{36}\b/;
const OPENAI_KEY = /\bsk-[A-Za-z0-9]{20,}\b/;

export function lintDescription(text: string, opts: { maxLength: number }): Finding[] {
  const findings: Finding[] = [];
  if (text.length > opts.maxLength) {
    findings.push({
      code: "description-too-long",
      severity: "error",
      message: `description length ${text.length} exceeds cap ${opts.maxLength}`
    });
  }
  if (!TRIGGER_STARTS.test(text)) {
    findings.push({
      code: "description-weak-trigger",
      severity: "warn",
      message: "description does not start with a recognized triggering verb-phrase"
    });
  }
  return findings;
}

export function lintBody(text: string): Finding[] {
  const findings: Finding[] = [];
  if (PLACEHOLDER.test(text)) {
    findings.push({
      code: "untemplated-placeholder",
      severity: "error",
      message: "body contains an untemplated {{placeholder}} token"
    });
  }
  if (AWS_KEY.test(text) || GH_TOKEN.test(text) || OPENAI_KEY.test(text)) {
    findings.push({
      code: "possible-secret",
      severity: "error",
      message: "body contains a token that matches a known secret pattern"
    });
  }
  return findings;
}
```

- [ ] **Step 4: Run tests**

```bash
cd tools/ts
npm test -- lint
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/ts/src/lint.ts tools/ts/test/lint.test.ts
git commit -m "feat(ts): add prose lint for descriptions and bodies"
```

---

## Task 8 — Compiler: `claude-skill`

**Files:**
- Create: `tools/ts/src/compile/types.ts`
- Create: `tools/ts/src/compile/claude-skill.ts`
- Create: `tools/ts/test/compile-claude-skill.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { compileClaudeSkill } from "../src/compile/claude-skill.js";

const skill = {
  id: "demo",
  raw: {
    specVersion: "1",
    id: "demo",
    version: "0.1.0",
    name: "Demo",
    description: "Use when verifying the Claude skill compiler.",
    body: { path: "body.md" },
    targets: { "claude-skill": { enabled: true, allowedTools: ["Read", "Edit"] } }
  },
  body: "## Demo body\n\nHello.\n"
};

describe("compileClaudeSkill", () => {
  it("emits SKILL.md with frontmatter and body", () => {
    const out = compileClaudeSkill(skill);
    expect(out.path).toBe("SKILL.md");
    expect(out.contents).toContain("name: demo");
    expect(out.contents).toContain("description: Use when verifying the Claude skill compiler.");
    expect(out.contents).toContain("allowed-tools:");
    expect(out.contents).toMatch(/---\n.*\n---\n\n## Demo body/s);
  });

  it("clips a description longer than 1024 chars", () => {
    const long = "x".repeat(2000);
    const out = compileClaudeSkill({ ...skill, raw: { ...skill.raw, description: long } });
    const match = /description: (.+)\n/.exec(out.contents);
    expect(match).not.toBeNull();
    expect(match![1].length).toBeLessThanOrEqual(1024);
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- compile-claude-skill
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/compile/types.ts`**

```ts
export interface SkillForCompile {
  id: string;
  raw: Record<string, unknown>;
  body: string;
}

export interface TargetArtifact {
  path: string;
  contents: string;
}
```

- [ ] **Step 4: Implement `src/compile/claude-skill.ts`**

```ts
import type { SkillForCompile, TargetArtifact } from "./types.js";

const MAX_DESCRIPTION = 1024;

function yamlEscape(value: string): string {
  if (/[:#&*!|>'"%@`]/.test(value) || /^\s|\s$/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

export function compileClaudeSkill(skill: SkillForCompile): TargetArtifact {
  const r = skill.raw as {
    id: string;
    description: string;
    targets?: { "claude-skill"?: { allowedTools?: string[]; model?: string } };
  };
  const target = r.targets?.["claude-skill"] ?? {};
  const description = r.description.slice(0, MAX_DESCRIPTION);

  const frontmatterLines = [
    "---",
    `name: ${yamlEscape(r.id)}`,
    `description: ${yamlEscape(description)}`
  ];
  if (target.allowedTools && target.allowedTools.length > 0) {
    frontmatterLines.push(`allowed-tools: [${target.allowedTools.map(yamlEscape).join(", ")}]`);
  }
  if (target.model) {
    frontmatterLines.push(`model: ${yamlEscape(target.model)}`);
  }
  frontmatterLines.push("---", "");

  return {
    path: "SKILL.md",
    contents: `${frontmatterLines.join("\n")}\n${skill.body}`
  };
}
```

- [ ] **Step 5: Run tests**

```bash
npm test -- compile-claude-skill
# Expected: PASS
```

- [ ] **Step 6: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): compile claude-skill target"
```

---

## Task 9 — Compiler: `claude-plugin`

**Files:**
- Create: `tools/ts/src/compile/claude-plugin.ts`
- Create: `tools/ts/test/compile-claude-plugin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { compileClaudePluginManifest } from "../src/compile/claude-plugin.js";

describe("compileClaudePluginManifest", () => {
  it("emits a plugin.json combining repo metadata and enabled skills", () => {
    const out = compileClaudePluginManifest({
      repo: { name: "llm-skills", version: "0.0.0", description: "test", author: "ravenoak" },
      skills: [
        { id: "demo", raw: { targets: { "claude-plugin": { enabled: true } } } }
      ]
    });
    expect(out.path).toBe("plugin.json");
    const json = JSON.parse(out.contents);
    expect(json.name).toBe("llm-skills");
    expect(json.skills).toEqual([{ source: "./skills/demo" }]);
  });

  it("omits skills that opt out of claude-plugin", () => {
    const out = compileClaudePluginManifest({
      repo: { name: "llm-skills", version: "0.0.0", description: "test", author: "ravenoak" },
      skills: [
        { id: "demo", raw: { targets: { "claude-plugin": { enabled: false } } } },
        { id: "other", raw: { targets: { "claude-plugin": { enabled: true } } } }
      ]
    });
    const json = JSON.parse(out.contents);
    expect(json.skills).toEqual([{ source: "./skills/other" }]);
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- compile-claude-plugin
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/compile/claude-plugin.ts`**

```ts
import type { TargetArtifact } from "./types.js";

export interface RepoMeta {
  name: string;
  version: string;
  description: string;
  author: string;
}

export interface MinimalSkillForPlugin {
  id: string;
  raw: { targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } } };
}

export function compileClaudePluginManifest(input: {
  repo: RepoMeta;
  skills: MinimalSkillForPlugin[];
}): TargetArtifact {
  const enabled = input.skills.filter(
    s => s.raw.targets?.["claude-plugin"]?.enabled !== false
  );
  const manifest = {
    name: input.repo.name,
    version: input.repo.version,
    description: input.repo.description,
    author: input.repo.author,
    skills: enabled.map(s => ({ source: `./skills/${s.id}` }))
  };
  return {
    path: "plugin.json",
    contents: `${JSON.stringify(manifest, null, 2)}\n`
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- compile-claude-plugin
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): assemble root plugin.json from enabled skills"
```

---

## Task 10 — Compiler: `openai-gpt`

**Files:**
- Create: `tools/ts/src/compile/openai.ts`
- Create: `tools/ts/test/compile-openai.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { compileOpenAI } from "../src/compile/openai.js";

const skill = {
  id: "demo",
  raw: {
    id: "demo",
    name: "Demo",
    description: "Use when testing the OpenAI compiler.",
    targets: {
      "openai-gpt": {
        enabled: true,
        conversationStarters: ["Hi!"],
        capabilities: ["web_browsing"]
      }
    }
  },
  body: "Body content."
};

describe("compileOpenAI", () => {
  it("emits manifest.json and instructions.md", () => {
    const artifacts = compileOpenAI(skill);
    const paths = artifacts.map(a => a.path).sort();
    expect(paths).toEqual(["instructions.md", "manifest.json"]);

    const manifest = JSON.parse(artifacts.find(a => a.path === "manifest.json")!.contents);
    expect(manifest.name).toBe("Demo");
    expect(manifest.description).toBe("Use when testing the OpenAI compiler.");
    expect(manifest.conversationStarters).toEqual(["Hi!"]);
    expect(manifest.capabilities).toEqual(["web_browsing"]);

    const instructions = artifacts.find(a => a.path === "instructions.md")!.contents;
    expect(instructions).toContain("Body content.");
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- compile-openai
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/compile/openai.ts`**

```ts
import type { SkillForCompile, TargetArtifact } from "./types.js";

export function compileOpenAI(skill: SkillForCompile): TargetArtifact[] {
  const r = skill.raw as {
    name: string;
    description: string;
    targets?: {
      "openai-gpt"?: {
        conversationStarters?: string[];
        capabilities?: string[];
        actionsSchema?: string;
      };
    };
  };
  const target = r.targets?.["openai-gpt"] ?? {};
  const manifest = {
    name: r.name,
    description: r.description,
    conversationStarters: target.conversationStarters ?? [],
    capabilities: target.capabilities ?? [],
    ...(target.actionsSchema ? { actionsSchema: target.actionsSchema } : {})
  };
  return [
    { path: "manifest.json", contents: `${JSON.stringify(manifest, null, 2)}\n` },
    { path: "instructions.md", contents: skill.body.endsWith("\n") ? skill.body : `${skill.body}\n` }
  ];
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- compile-openai
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): compile openai-gpt target"
```

---

## Task 11 — Compiler: `portable`

**Files:**
- Create: `tools/ts/src/compile/portable.ts`
- Create: `tools/ts/test/compile-portable.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { compilePortable } from "../src/compile/portable.js";

describe("compilePortable", () => {
  it("emits a single resolved skill.json with body inlined for distribution", () => {
    const artifacts = compilePortable({
      id: "demo",
      raw: {
        specVersion: "1",
        id: "demo",
        version: "0.1.0",
        name: "Demo",
        description: "Use when verifying the portable compiler.",
        body: { path: "body.md" }
      },
      body: "Body content.\n"
    });
    expect(artifacts).toHaveLength(1);
    const json = JSON.parse(artifacts[0]!.contents);
    expect(json.body).toEqual({ inline: "Body content.\n" });
    expect(json.specVersion).toBe("1");
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- compile-portable
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/compile/portable.ts`**

```ts
import type { SkillForCompile, TargetArtifact } from "./types.js";

export function compilePortable(skill: SkillForCompile): TargetArtifact[] {
  const resolved = {
    ...skill.raw,
    body: { inline: skill.body }
  };
  return [{ path: "skill.json", contents: `${JSON.stringify(resolved, null, 2)}\n` }];
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- compile-portable
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): compile portable bundle target"
```

---

## Task 12 — `skillsmith marketplace`

**Files:**
- Create: `tools/ts/src/marketplace.ts`
- Create: `tools/ts/test/marketplace.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildMarketplace } from "../src/marketplace.js";

describe("buildMarketplace", () => {
  it("emits an entry per skill with claude-plugin enabled", () => {
    const json = buildMarketplace({
      repo: { owner: "ravenoak", repo: "llm-skills" },
      skills: [
        {
          id: "demo",
          raw: {
            id: "demo",
            version: "1.2.3",
            description: "Use when wiring up the marketplace.",
            tags: ["test"],
            targets: { "claude-plugin": { enabled: true, category: "developer-tools" } }
          }
        },
        {
          id: "skipped",
          raw: {
            id: "skipped",
            version: "0.0.1",
            description: "Use when we should not appear in marketplace.json.",
            targets: { "claude-plugin": { enabled: false } }
          }
        }
      ]
    });
    expect(json.plugins).toHaveLength(1);
    expect(json.plugins[0]!.name).toBe("demo");
    expect(json.plugins[0]!.source).toBe("./skills/demo");
    expect(json.plugins[0]!.category).toBe("developer-tools");
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- marketplace
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/marketplace.ts`**

```ts
export interface MarketplaceRepo {
  owner: string;
  repo: string;
}

export interface MarketplaceSkill {
  id: string;
  raw: {
    id: string;
    version: string;
    description: string;
    tags?: string[];
    targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } };
  };
}

export interface MarketplaceJson {
  owner: string;
  repo: string;
  plugins: Array<{
    name: string;
    source: string;
    description: string;
    version: string;
    category?: string;
    tags?: string[];
  }>;
}

export function buildMarketplace(input: {
  repo: MarketplaceRepo;
  skills: MarketplaceSkill[];
}): MarketplaceJson {
  const plugins = input.skills
    .filter(s => s.raw.targets?.["claude-plugin"]?.enabled !== false)
    .map(s => {
      const category = s.raw.targets?.["claude-plugin"]?.category;
      return {
        name: s.id,
        source: `./skills/${s.id}`,
        description: s.raw.description,
        version: s.raw.version,
        ...(category ? { category } : {}),
        ...(s.raw.tags && s.raw.tags.length > 0 ? { tags: s.raw.tags } : {})
      };
    });
  return { owner: input.repo.owner, repo: input.repo.repo, plugins };
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- marketplace
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): generate marketplace.json from enabled skills"
```

---

## Task 13 — `skillsmith build` (orchestrator) and `check` (CI gate)

**Files:**
- Create: `tools/ts/src/load.ts`
- Create: `tools/ts/src/build.ts`
- Create: `tools/ts/src/check.ts`
- Create: `tools/ts/test/build.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildAll } from "../src/build.js";

let workspace: string;

beforeEach(() => {
  workspace = mkdtempSync(join(tmpdir(), "skillsmith-build-"));
  mkdirSync(join(workspace, "skills", "demo"), { recursive: true });
  writeFileSync(
    join(workspace, "skills", "demo", "skill.json"),
    JSON.stringify({
      specVersion: "1",
      id: "demo",
      version: "0.1.0",
      name: "Demo",
      description: "Use when verifying the build orchestrator end-to-end.",
      body: { path: "body.md" },
      targets: {
        "claude-skill": { enabled: true },
        "claude-plugin": { enabled: true },
        "openai-gpt": { enabled: true },
        "portable": { enabled: true }
      }
    })
  );
  writeFileSync(join(workspace, "skills", "demo", "body.md"), "Body.\n");
});

afterEach(() => rmSync(workspace, { recursive: true, force: true }));

describe("buildAll", () => {
  it("writes SKILL.md in-place and dist artifacts for non-Claude targets", async () => {
    await buildAll({
      root: workspace,
      repo: { owner: "ravenoak", repo: "llm-skills", version: "0.0.0", description: "x", author: "ravenoak" }
    });
    const skillMd = readFileSync(join(workspace, "skills", "demo", "SKILL.md"), "utf8");
    expect(skillMd).toContain("name: demo");

    const pluginJson = JSON.parse(readFileSync(join(workspace, "plugin.json"), "utf8"));
    expect(pluginJson.skills).toEqual([{ source: "./skills/demo" }]);

    const openaiManifest = JSON.parse(
      readFileSync(join(workspace, "dist", "openai", "demo", "manifest.json"), "utf8")
    );
    expect(openaiManifest.name).toBe("Demo");

    const portable = JSON.parse(
      readFileSync(join(workspace, "dist", "portable", "demo", "skill.json"), "utf8")
    );
    expect(portable.body).toEqual({ inline: "Body.\n" });

    const marketplace = JSON.parse(readFileSync(join(workspace, "marketplace.json"), "utf8"));
    expect(marketplace.plugins[0].name).toBe("demo");
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- build
# Expected: FAIL — build.js missing
```

- [ ] **Step 3: Implement `src/load.ts`**

```ts
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseSkill } from "./parse.js";

export interface LoadedSkill {
  dir: string;
  id: string;
  raw: Record<string, unknown>;
  body: string;
  bodyPath: string;
}

export async function loadSkills(skillsDir: string): Promise<LoadedSkill[]> {
  let entries: string[];
  try {
    entries = await readdir(skillsDir);
  } catch {
    return [];
  }
  const out: LoadedSkill[] = [];
  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const dir = resolve(skillsDir, name);
    const parsed = await parseSkill(dir);
    const bodyPath = parsed.body.path ?? parsed.body.template;
    if (!bodyPath) continue;
    const body = await readFile(resolve(dir, bodyPath), "utf8");
    out.push({ dir, id: parsed.id, raw: parsed.raw, body, bodyPath });
  }
  return out;
}
```

- [ ] **Step 4: Implement `src/build.ts`**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadSkills, type LoadedSkill } from "./load.js";
import { compileClaudeSkill } from "./compile/claude-skill.js";
import { compileClaudePluginManifest, type RepoMeta } from "./compile/claude-plugin.js";
import { compileOpenAI } from "./compile/openai.js";
import { compilePortable } from "./compile/portable.js";
import { buildMarketplace } from "./marketplace.js";

export interface BuildOptions {
  root: string;
  repo: RepoMeta & { owner: string; repo: string };
}

async function writeArtifact(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

function isEnabled(s: LoadedSkill, target: string): boolean {
  const t = (s.raw.targets as Record<string, { enabled?: boolean }> | undefined)?.[target];
  if (!t) return false;
  return t.enabled !== false;
}

export async function buildAll(opts: BuildOptions): Promise<void> {
  const skills = await loadSkills(resolve(opts.root, "skills"));

  for (const skill of skills) {
    if (isEnabled(skill, "claude-skill") || isEnabled(skill, "claude-plugin")) {
      const out = compileClaudeSkill(skill);
      await writeArtifact(resolve(skill.dir, out.path), out.contents);
    }
    if (isEnabled(skill, "openai-gpt")) {
      for (const out of compileOpenAI(skill)) {
        await writeArtifact(resolve(opts.root, "dist", "openai", skill.id, out.path), out.contents);
      }
    }
    if (isEnabled(skill, "portable")) {
      for (const out of compilePortable(skill)) {
        await writeArtifact(resolve(opts.root, "dist", "portable", skill.id, out.path), out.contents);
      }
    }
  }

  const pluginManifest = compileClaudePluginManifest({
    repo: opts.repo,
    skills: skills.map(s => ({ id: s.id, raw: s.raw as { targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } } } }))
  });
  await writeArtifact(resolve(opts.root, pluginManifest.path), pluginManifest.contents);

  const marketplace = buildMarketplace({
    repo: { owner: opts.repo.owner, repo: opts.repo.repo },
    skills: skills.map(s => ({ id: s.id, raw: s.raw as { id: string; version: string; description: string; tags?: string[]; targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } } } }))
  });
  await writeArtifact(resolve(opts.root, "marketplace.json"), `${JSON.stringify(marketplace, null, 2)}\n`);
}
```

- [ ] **Step 5: Implement `src/check.ts`**

```ts
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export interface CheckResult {
  clean: boolean;
  diff: string;
}

export function gitDiffClean(root: string): CheckResult {
  try {
    execFileSync("git", ["diff", "--exit-code", "--", "."], { cwd: resolve(root), stdio: "pipe" });
    return { clean: true, diff: "" };
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    const diff = (err.stdout?.toString() ?? "") + (err.stderr?.toString() ?? "");
    return { clean: false, diff };
  }
}
```

- [ ] **Step 6: Run tests**

```bash
npm test -- build
# Expected: PASS
```

- [ ] **Step 7: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): orchestrate full build and add git-clean check"
```

---

## Task 14 — `skillsmith new` and CLI wiring

**Files:**
- Modify: `tools/ts/src/cli.ts` (replace stub with full Commander wiring)
- Create: `tools/ts/src/new.ts`
- Create: `tools/ts/test/new.test.ts`

- [ ] **Step 1: Write the failing test for `new`**

```ts
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scaffoldSkill } from "../src/new.js";

let workspace: string;
beforeEach(() => { workspace = mkdtempSync(join(tmpdir(), "skillsmith-new-")); });
afterEach(() => rmSync(workspace, { recursive: true, force: true }));

describe("scaffoldSkill", () => {
  it("creates skill.json and body.md in the right place", async () => {
    await scaffoldSkill({ root: workspace, id: "new-skill" });
    const skillJson = JSON.parse(
      readFileSync(join(workspace, "skills", "new-skill", "skill.json"), "utf8")
    );
    expect(skillJson.id).toBe("new-skill");
    expect(skillJson.specVersion).toBe("1");
    expect(existsSync(join(workspace, "skills", "new-skill", "body.md"))).toBe(true);
  });

  it("refuses to overwrite an existing skill directory", async () => {
    await scaffoldSkill({ root: workspace, id: "dup" });
    await expect(scaffoldSkill({ root: workspace, id: "dup" })).rejects.toThrow(/already exists/);
  });
});
```

- [ ] **Step 2: Run test (expected fail)**

```bash
npm test -- new
# Expected: FAIL
```

- [ ] **Step 3: Implement `src/new.ts`**

```ts
import { mkdir, writeFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const ID_RE = /^[a-z][a-z0-9-]{1,63}$/;

export async function scaffoldSkill(opts: { root: string; id: string }): Promise<void> {
  if (!ID_RE.test(opts.id)) {
    throw new Error(`invalid skill id: ${opts.id}`);
  }
  const dir = resolve(opts.root, "skills", opts.id);
  try {
    await stat(dir);
    throw new Error(`skill ${opts.id} already exists at ${dir}`);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  await mkdir(dir, { recursive: true });

  const skillJson = {
    specVersion: "1",
    id: opts.id,
    version: "0.0.1",
    name: opts.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    description: `Use when <fill in the trigger phrase for ${opts.id}>.`,
    body: { path: "body.md" },
    targets: {
      "claude-skill": { enabled: true },
      "claude-plugin": { enabled: true },
      "openai-gpt": { enabled: false },
      "portable": { enabled: true }
    }
  };

  await writeFile(resolve(dir, "skill.json"), `${JSON.stringify(skillJson, null, 2)}\n`);
  await writeFile(
    resolve(dir, "body.md"),
    `# ${skillJson.name}\n\nReplace this body with the skill instructions.\n`
  );
}
```

- [ ] **Step 4: Replace `src/cli.ts` with Commander wiring**

```ts
import { Command } from "commander";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { loadSkills } from "./load.js";
import { validateSkillDir } from "./validate.js";
import { lintBody, lintDescription } from "./lint.js";
import { buildAll } from "./build.js";
import { gitDiffClean } from "./check.js";
import { scaffoldSkill } from "./new.js";
import { repoRoot } from "./paths.js";

export const version = "0.1.0";

async function readRepoMeta(root: string): Promise<{ owner: string; repo: string; version: string; name: string; description: string; author: string }> {
  try {
    const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
    return {
      owner: "ravenoak",
      repo: "llm-skills",
      name: "llm-skills",
      version: pkg.version ?? "0.0.0",
      description: pkg.description ?? "",
      author: pkg.author ?? "ravenoak"
    };
  } catch {
    return { owner: "ravenoak", repo: "llm-skills", name: "llm-skills", version: "0.0.0", description: "", author: "ravenoak" };
  }
}

async function runValidate(root: string): Promise<number> {
  const skills = await loadSkills(resolve(root, "skills"));
  let failed = 0;
  for (const s of skills) {
    const r = await validateSkillDir(s.dir);
    if (!r.ok) {
      console.error(`✗ ${s.id}`);
      for (const e of r.errors) console.error(`  ${e}`);
      failed++;
    } else {
      console.log(`✓ ${s.id}`);
    }
  }
  return failed === 0 ? 0 : 1;
}

async function runLint(root: string): Promise<number> {
  const skills = await loadSkills(resolve(root, "skills"));
  let errors = 0;
  for (const s of skills) {
    const desc = (s.raw.description as string) ?? "";
    const findings = [...lintDescription(desc, { maxLength: 1024 }), ...lintBody(s.body)];
    for (const f of findings) {
      const tag = f.severity === "error" ? "ERR" : "WARN";
      console[f.severity === "error" ? "error" : "warn"](`${tag} ${s.id}: ${f.code} — ${f.message}`);
      if (f.severity === "error") errors++;
    }
  }
  return errors === 0 ? 0 : 1;
}

async function runBuild(root: string): Promise<number> {
  const meta = await readRepoMeta(root);
  await buildAll({ root, repo: meta });
  return 0;
}

async function runCheck(root: string): Promise<number> {
  if ((await runValidate(root)) !== 0) return 1;
  if ((await runLint(root)) !== 0) return 1;
  if ((await runBuild(root)) !== 0) return 1;
  const { clean, diff } = gitDiffClean(root);
  if (!clean) {
    console.error("✗ git working tree is dirty after build — commit regenerated artifacts:");
    console.error(diff);
    return 1;
  }
  console.log("✓ check passed");
  return 0;
}

async function main(): Promise<void> {
  const program = new Command();
  program.name("skillsmith").version(version).description("Build and validate llm-skills");

  program.command("validate").action(async () => process.exit(await runValidate(repoRoot)));
  program.command("lint").action(async () => process.exit(await runLint(repoRoot)));
  program.command("build").action(async () => process.exit(await runBuild(repoRoot)));
  program.command("check").action(async () => process.exit(await runCheck(repoRoot)));
  program
    .command("new <id>")
    .description("scaffold a new skill")
    .action(async (id: string) => {
      await scaffoldSkill({ root: repoRoot, id });
      console.log(`Created skills/${id}/skill.json and body.md`);
    });

  await program.parseAsync();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
```

- [ ] **Step 5: Run all tests + typecheck**

```bash
cd tools/ts
npm test
# Expected: PASS (all suites)
npm run typecheck
# Expected: PASS
npm run build
# Expected: dist/cli.js produced
```

- [ ] **Step 6: Commit**

```bash
git add tools/ts
git commit -m "feat(ts): scaffold new skills and wire full CLI"
```

---

## Task 15 — Python package bootstrap (`llm-skills`)

**Files:**
- Create: `tools/py/pyproject.toml`
- Create: `tools/py/README.md`
- Create: `tools/py/src/llm_skills/__init__.py`
- Create: `tools/py/src/llm_skills/cli.py` (stub)
- Create: `tools/py/tests/test_smoke.py`

- [ ] **Step 1: Write `tools/py/pyproject.toml`**

```toml
[project]
name = "llm-skills"
version = "0.1.0"
description = "Evaluate, draft, and score llm-skills."
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.13"
authors = [{ name = "ravenoak" }]
dependencies = [
  "anthropic>=0.40",
  "openai>=1.50",
  "jsonschema>=4.23",
  "click>=8.1",
  "pydantic>=2.8"
]

[project.scripts]
llm-skills = "llm_skills.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/llm_skills"]

[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM", "RUF"]

[tool.mypy]
python_version = "3.13"
strict = true
files = ["src/llm_skills", "tests"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra -q"
```

- [ ] **Step 2: Write `tools/py/README.md`**

```markdown
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
```

- [ ] **Step 3: Write `tools/py/src/llm_skills/__init__.py`**

```python
"""Python tooling for llm-skills."""

__version__ = "0.1.0"
```

- [ ] **Step 4: Write the failing smoke test**

`tools/py/tests/test_smoke.py`:

```python
from llm_skills import __version__


def test_version_is_semver() -> None:
    parts = __version__.split(".")
    assert len(parts) >= 3
    assert all(p.split("-")[0].isdigit() for p in parts[:3])
```

`tools/py/src/llm_skills/cli.py`:

```python
"""Entry point for the llm-skills CLI (stubbed; real commands added later)."""

from __future__ import annotations

import click

from llm_skills import __version__


@click.group()
@click.version_option(__version__)
def main() -> None:
    """llm-skills: evaluate and draft skills."""


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Sync env and run tests**

```bash
cd tools/py
uv sync
uv run pytest
# Expected: PASS
uv run ruff check
# Expected: PASS
uv run mypy
# Expected: PASS
```

- [ ] **Step 6: Commit**

```bash
git add tools/py uv.lock 2>/dev/null || true
git add tools/py
git commit -m "feat(py): bootstrap llm-skills Python package"
```

---

## Task 16 — Python: schema-validated skill loader

**Files:**
- Create: `tools/py/src/llm_skills/loader.py`
- Create: `tools/py/tests/test_loader.py`
- Create: `tools/py/tests/fixtures/good-skill/skill.json`
- Create: `tools/py/tests/fixtures/good-skill/body.md`

- [ ] **Step 1: Write the failing test**

```python
from pathlib import Path

import pytest

from llm_skills.loader import LoadError, load_skill


FIXTURES = Path(__file__).parent / "fixtures"


def test_load_skill_returns_resolved_body() -> None:
    skill = load_skill(FIXTURES / "good-skill")
    assert skill.id == "good-skill"
    assert skill.body.strip() == "Fixture body content."


def test_load_skill_rejects_id_dir_mismatch(tmp_path: Path) -> None:
    (tmp_path / "skill.json").write_text(
        '{"specVersion":"1","id":"other","version":"0.0.1","name":"x",'
        '"description":"Use when verifying mismatch detection.","body":{"path":"body.md"}}'
    )
    (tmp_path / "body.md").write_text("x")
    with pytest.raises(LoadError, match="id does not match"):
        load_skill(tmp_path)
```

`tools/py/tests/fixtures/good-skill/skill.json`:

```json
{
  "specVersion": "1",
  "id": "good-skill",
  "version": "0.1.0",
  "name": "Good Skill",
  "description": "Use when the Python loader needs a known-good fixture.",
  "body": { "path": "body.md" }
}
```

`tools/py/tests/fixtures/good-skill/body.md`:

```markdown
Fixture body content.
```

- [ ] **Step 2: Run test (expected fail)**

```bash
cd tools/py
uv run pytest -k loader
# Expected: FAIL — loader module missing
```

- [ ] **Step 3: Implement `loader.py`**

```python
"""Load and validate llm-skills portable manifests."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import jsonschema


SPEC_DIR = Path(__file__).resolve().parents[3] / "spec"
SCHEMA_PATH = SPEC_DIR / "skill.schema.json"


class LoadError(RuntimeError):
    """Raised when a skill cannot be loaded or fails validation."""


@dataclass(frozen=True)
class Skill:
    dir: Path
    id: str
    raw: dict[str, Any]
    body: str


def _validator() -> jsonschema.Draft202012Validator:
    with SCHEMA_PATH.open("r", encoding="utf-8") as fh:
        schema = json.load(fh)
    return jsonschema.Draft202012Validator(schema)


def load_skill(dir_: Path) -> Skill:
    manifest_path = dir_ / "skill.json"
    if not manifest_path.exists():
        raise LoadError(f"skill.json missing at {manifest_path}")
    raw = json.loads(manifest_path.read_text(encoding="utf-8"))

    errors = sorted(_validator().iter_errors(raw), key=lambda e: list(e.absolute_path))
    if errors:
        joined = "; ".join(f"{list(e.absolute_path) or '/'}: {e.message}" for e in errors)
        raise LoadError(f"schema validation failed: {joined}")

    if raw["id"] != dir_.name:
        raise LoadError(f"id does not match directory name: {raw['id']} vs {dir_.name}")

    body_ref = raw["body"]
    body_path = dir_ / (body_ref.get("path") or body_ref.get("template"))
    if not body_path.exists():
        raise LoadError(f"body file missing: {body_path}")
    body = body_path.read_text(encoding="utf-8")

    return Skill(dir=dir_, id=raw["id"], raw=raw, body=body)
```

- [ ] **Step 4: Run tests**

```bash
cd tools/py
uv run pytest -k loader
# Expected: PASS
uv run mypy
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/py
git commit -m "feat(py): add schema-validated skill loader"
```

---

## Task 17 — Python: static `score` command

**Files:**
- Create: `tools/py/src/llm_skills/score.py`
- Create: `tools/py/tests/test_score.py`

- [ ] **Step 1: Write the failing test**

```python
from llm_skills.score import score_description


def test_score_flags_weak_trigger() -> None:
    findings = score_description("This is a thing.")
    assert any(f.code == "description-weak-trigger" for f in findings)


def test_score_passes_strong_trigger() -> None:
    findings = score_description("Use when refactoring Python files.")
    errors = [f for f in findings if f.severity == "error"]
    assert errors == []


def test_score_flags_excessive_length() -> None:
    findings = score_description("Use when " + ("x" * 2000))
    assert any(f.code == "description-too-long" for f in findings)
```

- [ ] **Step 2: Run test (expected fail)**

```bash
uv run pytest -k score
# Expected: FAIL
```

- [ ] **Step 3: Implement `score.py`**

```python
"""Static prose heuristics for skill descriptions and bodies."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

Severity = Literal["error", "warn"]


@dataclass(frozen=True)
class Finding:
    code: str
    severity: Severity
    message: str


_TRIGGER = re.compile(r"^(use when|when |for |handles |triggers )", re.IGNORECASE)
_MAX_DESCRIPTION = 1024


def score_description(text: str) -> list[Finding]:
    findings: list[Finding] = []
    if len(text) > _MAX_DESCRIPTION:
        findings.append(
            Finding(
                code="description-too-long",
                severity="error",
                message=f"description length {len(text)} exceeds cap {_MAX_DESCRIPTION}",
            )
        )
    if not _TRIGGER.match(text):
        findings.append(
            Finding(
                code="description-weak-trigger",
                severity="warn",
                message="description does not start with a recognized triggering verb-phrase",
            )
        )
    return findings
```

- [ ] **Step 4: Run tests**

```bash
uv run pytest -k score
# Expected: PASS
uv run mypy
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/py
git commit -m "feat(py): add static description scorer"
```

---

## Task 18 — Python: `eval` (Anthropic SDK, prompt caching)

**Files:**
- Create: `tools/py/src/llm_skills/eval.py`
- Create: `tools/py/tests/test_eval.py`

The `eval` command calls the Anthropic SDK. The test must not hit the network — we inject a fake client.

- [ ] **Step 1: Write the failing test**

```python
from pathlib import Path
from typing import Any

from llm_skills.eval import EvalConfig, EvalRunner, ExampleResult
from llm_skills.loader import Skill


class _FakeClient:
    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []

    class _Messages:
        def __init__(self, outer: "_FakeClient") -> None:
            self.outer = outer

        def create(self, **kwargs: Any) -> Any:  # noqa: ANN401
            self.outer.calls.append(kwargs)

            class _Content:
                text = "ok"

            class _Resp:
                content = [_Content()]
                usage = type("u", (), {"input_tokens": 10, "output_tokens": 5, "cache_read_input_tokens": 7})

            return _Resp()

    @property
    def messages(self) -> "_FakeClient._Messages":
        return _FakeClient._Messages(self)


def test_eval_runner_uses_prompt_caching_and_returns_results(tmp_path: Path) -> None:
    skill = Skill(
        dir=tmp_path,
        id="demo",
        raw={
            "examples": [
                {"input": "hi", "expectedBehavior": "respond politely"}
            ]
        },
        body="system body",
    )
    client = _FakeClient()
    runner = EvalRunner(client=client, config=EvalConfig(model="claude-sonnet-4-6"))
    results = runner.run(skill)

    assert len(results) == 1
    assert isinstance(results[0], ExampleResult)
    assert results[0].output == "ok"
    assert client.calls, "model was not invoked"

    call = client.calls[0]
    system_blocks = call["system"]
    assert any(
        isinstance(b, dict) and b.get("cache_control", {}).get("type") == "ephemeral"
        for b in system_blocks
    ), "system block must include prompt caching"
```

- [ ] **Step 2: Run test (expected fail)**

```bash
uv run pytest -k eval
# Expected: FAIL
```

- [ ] **Step 3: Implement `eval.py`**

```python
"""Run skill example fixtures through Claude (with prompt caching) and record results."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from llm_skills.loader import Skill


class _Messages(Protocol):
    def create(self, **kwargs: Any) -> Any: ...  # noqa: ANN401


class _Client(Protocol):
    @property
    def messages(self) -> _Messages: ...


@dataclass(frozen=True)
class EvalConfig:
    model: str
    max_tokens: int = 1024


@dataclass(frozen=True)
class ExampleResult:
    input: str
    expected_behavior: str
    output: str
    input_tokens: int
    output_tokens: int
    cache_read_input_tokens: int


class EvalRunner:
    def __init__(self, client: _Client, config: EvalConfig) -> None:
        self._client = client
        self._config = config

    def run(self, skill: Skill) -> list[ExampleResult]:
        examples = skill.raw.get("examples", [])
        if not isinstance(examples, list):
            return []

        # Prompt caching: mark the (large, stable) skill body as ephemeral
        # so it's reused across every example invocation in this run.
        system_blocks = [
            {"type": "text", "text": skill.body, "cache_control": {"type": "ephemeral"}},
        ]

        results: list[ExampleResult] = []
        for ex in examples:
            response = self._client.messages.create(
                model=self._config.model,
                max_tokens=self._config.max_tokens,
                system=system_blocks,
                messages=[{"role": "user", "content": ex["input"]}],
            )
            text = response.content[0].text if response.content else ""
            usage = response.usage
            results.append(
                ExampleResult(
                    input=ex["input"],
                    expected_behavior=ex["expectedBehavior"],
                    output=text,
                    input_tokens=getattr(usage, "input_tokens", 0),
                    output_tokens=getattr(usage, "output_tokens", 0),
                    cache_read_input_tokens=getattr(usage, "cache_read_input_tokens", 0),
                )
            )
        return results
```

- [ ] **Step 4: Run tests**

```bash
uv run pytest -k eval
# Expected: PASS
uv run mypy
# Expected: PASS
```

- [ ] **Step 5: Commit**

```bash
git add tools/py
git commit -m "feat(py): add eval runner with Anthropic prompt caching"
```

---

## Task 19 — Python: `draft` and CLI wiring

**Files:**
- Create: `tools/py/src/llm_skills/draft.py`
- Modify: `tools/py/src/llm_skills/cli.py` (replace stub)
- Create: `tools/py/tests/test_draft.py`
- Create: `tools/py/tests/test_cli.py`

- [ ] **Step 1: Write the failing draft test**

```python
from pathlib import Path
from typing import Any

from llm_skills.draft import DraftConfig, drafter


class _FakeClient:
    def messages_create(self, **kwargs: Any) -> str:  # noqa: ANN401
        return (
            '```json\n'
            '{"specVersion":"1","id":"new-skill","version":"0.0.1","name":"New",'
            '"description":"Use when drafting.","body":{"path":"body.md"}}\n'
            '```\n\n'
            '```markdown\n# New\n\nBody.\n```\n'
        )


def test_drafter_writes_skill_json_and_body(tmp_path: Path) -> None:
    out_dir = tmp_path / "skills" / "new-skill"
    drafter(
        topic="test topic",
        out_dir=out_dir,
        client_call=_FakeClient().messages_create,
        config=DraftConfig(model="claude-sonnet-4-6"),
    )
    assert (out_dir / "skill.json").exists()
    assert (out_dir / "body.md").exists()
```

- [ ] **Step 2: Run test (expected fail)**

```bash
uv run pytest -k draft
# Expected: FAIL
```

- [ ] **Step 3: Implement `draft.py`**

```python
"""LLM-assisted drafting of new skill manifests and bodies."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable


@dataclass(frozen=True)
class DraftConfig:
    model: str
    max_tokens: int = 2048


_JSON_FENCE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL)
_MD_FENCE = re.compile(r"```markdown\s*\n(.*?)\n```", re.DOTALL)


def _system_prompt() -> str:
    return (
        "You are drafting an llm-skills portable skill manifest. "
        "Reply with exactly two fenced code blocks: first ```json``` with the manifest "
        "(specVersion '1', body as {path: 'body.md'}), then ```markdown``` with the body."
    )


def drafter(
    *,
    topic: str,
    out_dir: Path,
    client_call: Callable[..., str],
    config: DraftConfig,
) -> None:
    raw = client_call(
        model=config.model,
        max_tokens=config.max_tokens,
        system=_system_prompt(),
        user=f"Draft a skill for: {topic}",
    )
    json_match = _JSON_FENCE.search(raw)
    md_match = _MD_FENCE.search(raw)
    if not json_match or not md_match:
        raise RuntimeError("draft response did not contain both required code blocks")

    manifest = json.loads(json_match.group(1))
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "skill.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "body.md").write_text(md_match.group(1).rstrip() + "\n", encoding="utf-8")
```

- [ ] **Step 4: Run draft test**

```bash
uv run pytest -k draft
# Expected: PASS
```

- [ ] **Step 5: Replace `cli.py` with full Click wiring**

```python
"""Entry point for the llm-skills CLI."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import click

from llm_skills import __version__
from llm_skills.eval import EvalConfig, EvalRunner
from llm_skills.loader import LoadError, load_skill
from llm_skills.score import score_description

REPO_ROOT = Path(__file__).resolve().parents[3]
SKILLS_DIR = REPO_ROOT / "skills"
REPORTS_DIR = REPO_ROOT / "dist" / "reports"


def _anthropic_client() -> Any:  # noqa: ANN401
    try:
        from anthropic import Anthropic
    except ImportError as e:  # pragma: no cover
        raise click.ClickException("anthropic SDK not installed") from e
    return Anthropic()


@click.group()
@click.version_option(__version__)
def main() -> None:
    """llm-skills CLI."""


def _resolve_targets(skill_id: str | None, all_: bool) -> list[Path]:
    if all_:
        return sorted(p for p in SKILLS_DIR.iterdir() if p.is_dir()) if SKILLS_DIR.exists() else []
    if skill_id is None:
        raise click.UsageError("provide a skill id or pass --all")
    return [SKILLS_DIR / skill_id]


@main.command()
@click.argument("skill_id", required=False)
@click.option("--all", "all_", is_flag=True, help="evaluate every skill that declares examples")
@click.option("--model", default="claude-sonnet-4-6", show_default=True)
def eval(skill_id: str | None, all_: bool, model: str) -> None:
    """Run example fixtures through the model and write reports."""
    targets = _resolve_targets(skill_id, all_)
    if not targets:
        raise click.ClickException("no skills to evaluate")

    client = _anthropic_client()
    runner = EvalRunner(client=client, config=EvalConfig(model=model))
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    for d in targets:
        try:
            skill = load_skill(d)
        except LoadError as e:
            raise click.ClickException(str(e)) from e
        results = runner.run(skill)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        out = REPORTS_DIR / f"{skill.id}-{stamp}.json"
        out.write_text(
            json.dumps([r.__dict__ for r in results], indent=2) + "\n",
            encoding="utf-8",
        )
        click.echo(f"wrote {out}")


@main.command()
@click.argument("skill_id")
def score(skill_id: str) -> None:
    """Print static heuristics for a skill description."""
    skill = load_skill(SKILLS_DIR / skill_id)
    findings = score_description(skill.raw["description"])
    if not findings:
        click.echo(f"{skill_id}: ok")
        return
    for f in findings:
        click.echo(f"{f.severity.upper()} {skill_id}: {f.code} — {f.message}")


@main.command()
@click.argument("topic")
@click.option("--id", "skill_id", required=True, help="new skill id")
@click.option("--model", default="claude-sonnet-4-6", show_default=True)
def draft(topic: str, skill_id: str, model: str) -> None:
    """Use an LLM to draft skill.json + body.md from a topic."""
    from llm_skills.draft import DraftConfig, drafter

    client = _anthropic_client()

    def call(**kwargs: Any) -> str:  # noqa: ANN401
        resp = client.messages.create(
            model=kwargs["model"],
            max_tokens=kwargs["max_tokens"],
            system=kwargs["system"],
            messages=[{"role": "user", "content": kwargs["user"]}],
        )
        return resp.content[0].text if resp.content else ""

    out_dir = SKILLS_DIR / skill_id
    drafter(topic=topic, out_dir=out_dir, client_call=call, config=DraftConfig(model=model))
    click.echo(f"drafted skill at {out_dir}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Write a CLI smoke test**

`tools/py/tests/test_cli.py`:

```python
from click.testing import CliRunner

from llm_skills.cli import main


def test_help_lists_subcommands() -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    for cmd in ("eval", "score", "draft"):
        assert cmd in result.output
```

- [ ] **Step 7: Run all tests**

```bash
uv run pytest
# Expected: PASS
uv run ruff check
# Expected: PASS
uv run mypy
# Expected: PASS
```

- [ ] **Step 8: Commit**

```bash
git add tools/py
git commit -m "feat(py): wire draft, eval, and score CLI commands"
```

---

## Task 20 — Taskfile

**Files:**
- Create: `Taskfile.yml`

- [ ] **Step 1: Write `Taskfile.yml`**

```yaml
version: "3"

tasks:
  setup:
    desc: Install Node and Python tooling.
    cmds:
      - npm --prefix tools/ts ci
      - cd tools/py && uv sync

  validate:
    desc: Validate every skill manifest.
    cmds:
      - npm --prefix tools/ts exec -- skillsmith validate

  lint:
    desc: Run prose lint over all skills.
    cmds:
      - npm --prefix tools/ts exec -- skillsmith lint

  build:
    desc: Compile every target.
    cmds:
      - npm --prefix tools/ts run build
      - npm --prefix tools/ts exec -- skillsmith build

  check:
    desc: Full CI gate (validate + lint + build + git-clean).
    cmds:
      - npm --prefix tools/ts run typecheck
      - npm --prefix tools/ts run lint
      - npm --prefix tools/ts test
      - cd tools/py && uv run ruff check
      - cd tools/py && uv run mypy
      - cd tools/py && uv run pytest
      - npm --prefix tools/ts exec -- skillsmith check

  eval:
    desc: Run evals (network calls; gated by LLM_SKILLS_RUN_EVALS=1).
    preconditions:
      - sh: '[ "$LLM_SKILLS_RUN_EVALS" = "1" ]'
        msg: 'eval is gated; set LLM_SKILLS_RUN_EVALS=1 to run'
    cmds:
      - cd tools/py && uv run llm-skills eval --all

  clean:
    desc: Remove built outputs.
    cmds:
      - rm -rf dist tools/ts/dist
```

- [ ] **Step 2: Verify task list**

```bash
task --list
# Expected: setup / validate / lint / build / check / eval / clean
```

- [ ] **Step 3: Commit**

```bash
git add Taskfile.yml
git commit -m "chore: add Taskfile to orchestrate TS and Python tooling"
```

---

## Task 21 — Empty initial state: `plugin.json`, `marketplace.json`, `skills/.gitkeep`

**Files:**
- Create: `plugin.json`
- Create: `marketplace.json`
- Create: `skills/.gitkeep`

- [ ] **Step 1: Generate the empty manifests via `skillsmith build`**

```bash
mkdir -p skills && touch skills/.gitkeep
task build
# Expected: plugin.json and marketplace.json written; dist/ created and ignored
```

- [ ] **Step 2: Verify contents**

```bash
cat plugin.json
# Expected: {"name":"llm-skills", ..., "skills":[]}
cat marketplace.json
# Expected: {"owner":"ravenoak","repo":"llm-skills","plugins":[]}
```

- [ ] **Step 3: Commit**

```bash
git add plugin.json marketplace.json skills/.gitkeep
git commit -m "chore: initialize empty plugin and marketplace manifests"
```

---

## Task 22 — Docs: authoring, targets, governance

**Files:**
- Create: `docs/authoring.md`
- Create: `docs/targets/claude-skill.md`
- Create: `docs/targets/claude-plugin.md`
- Create: `docs/targets/openai.md`
- Create: `docs/governance.md`

- [ ] **Step 1: Write `docs/authoring.md`**

````markdown
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
````

- [ ] **Step 2: Write `docs/targets/claude-skill.md`**

```markdown
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
```

- [ ] **Step 3: Write `docs/targets/claude-plugin.md`**

```markdown
# Target: claude-plugin

Assembles the root `plugin.json` from repo metadata and the set of skills whose `targets.claude-plugin.enabled !== false`.

Skill-bundled commands, agents, and hooks (placed under `skills/<id>/overrides/claude-plugin/{commands,agents,hooks}/`) are merged into root-level directories during build.

`marketplace.json` is the marketplace index: one entry per `claude-plugin`-enabled skill. Always generated; never hand-edited.
```

- [ ] **Step 4: Write `docs/targets/openai.md`**

```markdown
# Target: openai-gpt

Emits two files per skill into `dist/openai/<id>/`:

- `manifest.json` — `{ name, description, conversationStarters, capabilities, actionsSchema? }`
- `instructions.md` — body (or `overrides/openai-gpt.md` if present)

Use these to populate a custom GPT or App. The bundle is packaged as `openai-bundle.tar.gz` at release time.
```

- [ ] **Step 5: Write `docs/governance.md`**

```markdown
# Governance

## Branch protection (manual setup)

On GitHub: Settings → Branches → main → require:

- `validate.yml / ts-check`
- `validate.yml / py-check`
- `validate.yml / schema-check`
- `validate.yml / security`
- 1 approving review
- Signed commits

## Release process

1. Update `[Unreleased]` to `[X.Y.Z] — YYYY-MM-DD` in `CHANGELOG.md`.
2. Bump versions in `tools/ts/package.json` and `tools/py/pyproject.toml` if they changed.
3. `git tag vX.Y.Z && git push --tags`.
4. The `release.yml` workflow handles GitHub Release, npm publish, and PyPI publish.

## Versioning

- Spec (`specVersion`): major bump triggers a major repo release.
- Tools: independent semver.
- Skills: independent semver per skill.
```

- [ ] **Step 6: Commit**

```bash
git add docs
git commit -m "docs: authoring, target mapping, and governance docs"
```

---

## Task 23 — CI: `validate.yml`

**Files:**
- Create: `.github/workflows/validate.yml`

- [ ] **Step 1: Write `validate.yml`**

```yaml
name: validate

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: validate-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ts-check:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: tools/ts } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm', cache-dependency-path: tools/ts/package-lock.json }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: skillsmith check
        working-directory: .
        run: node tools/ts/dist/cli.js check

  py-check:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: tools/py } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - uses: astral-sh/setup-uv@v3
      - run: uv sync
      - run: uv run ruff check
      - run: uv run mypy
      - run: uv run pytest

  schema-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npx --yes ajv-cli@5 compile -s spec/skill.schema.json --spec=draft2020
      - run: npx --yes ajv-cli@5 compile -s spec/marketplace-entry.schema.json --spec=draft2020

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm --prefix tools/ts ci
      - run: npm --prefix tools/ts audit --omit=dev
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - uses: astral-sh/setup-uv@v3
      - run: cd tools/py && uv sync
      - run: cd tools/py && uv run pip-audit --strict
      - name: semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/validate.yml
git commit -m "ci: add validate workflow"
```

---

## Task 24 — CI: `release.yml`

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Write `release.yml`**

```yaml
name: release

on:
  push:
    tags: ['v*.*.*']

permissions:
  contents: write
  id-token: write   # required for npm provenance + PyPI Trusted Publishing

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.meta.outputs.tag }}
      version: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - id: meta
        run: |
          TAG="${GITHUB_REF_NAME}"
          VERSION="${TAG#v}"
          echo "tag=$TAG" >> "$GITHUB_OUTPUT"
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"
      - name: CHANGELOG must match tag
        run: |
          HEAD_HEADING=$(grep -m1 -E '^## \[[^]]+\]' CHANGELOG.md | sed -E 's/^## \[([^]]+)\].*/\1/')
          if [ "$HEAD_HEADING" != "${{ steps.meta.outputs.version }}" ]; then
            echo "CHANGELOG topmost heading is '$HEAD_HEADING'; expected '${{ steps.meta.outputs.version }}'"
            exit 1
          fi
      - uses: actions/setup-node@v4
        with: { node-version: '24', cache: 'npm', cache-dependency-path: tools/ts/package-lock.json }
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - uses: astral-sh/setup-uv@v3
      - run: npm --prefix tools/ts ci
      - run: npm --prefix tools/ts run build
      - run: cd tools/py && uv sync
      - name: Build all targets
        run: node tools/ts/dist/cli.js build
      - name: Package tarballs
        run: |
          mkdir -p release-artifacts
          tar -czf release-artifacts/claude-plugin.tar.gz plugin.json marketplace.json skills commands agents hooks 2>/dev/null || tar -czf release-artifacts/claude-plugin.tar.gz plugin.json marketplace.json skills
          tar -czf release-artifacts/openai-bundle.tar.gz -C dist openai
          tar -czf release-artifacts/portable-bundle.tar.gz -C dist portable
      - uses: softprops/action-gh-release@v2
        with:
          files: release-artifacts/*.tar.gz

  publish-npm:
    needs: build
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: tools/ts } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24', registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  publish-pypi:
    needs: build
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: tools/py } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - uses: astral-sh/setup-uv@v3
      - run: uv sync
      - run: uv build
      - uses: pypa/gh-action-pypi-publish@release/v1
        with:
          packages-dir: tools/py/dist
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release workflow with npm provenance and PyPI Trusted Publishing"
```

---

## Task 25 — CI: `audit.yml`

**Files:**
- Create: `.github/workflows/audit.yml`

- [ ] **Step 1: Write `audit.yml`**

```yaml
name: audit

on:
  schedule:
    - cron: '0 9 * * 1'   # Mondays 09:00 UTC
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - uses: astral-sh/setup-uv@v3
      - run: npm --prefix tools/ts ci
      - id: npm-audit
        continue-on-error: true
        run: npm --prefix tools/ts audit --audit-level=high --json | tee npm-audit.json
      - run: cd tools/py && uv sync
      - id: pip-audit
        continue-on-error: true
        run: cd tools/py && uv run pip-audit --strict --format json | tee ../../pip-audit.json
      - uses: google/osv-scanner-action@v1
        with: { scan-args: --recursive --skip-git ./ }
        continue-on-error: true
      - name: Open issue on failure
        if: failure() || steps.npm-audit.outcome == 'failure' || steps.pip-audit.outcome == 'failure'
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: 'Weekly audit found issues'
          content-filepath: |
            npm-audit.json
            pip-audit.json
          labels: security, audit
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/audit.yml
git commit -m "ci: add weekly security audit workflow"
```

---

## Task 26 — End-to-end smoke verification

**Files:** none (verification only)

- [ ] **Step 1: From a clean checkout, run setup and check**

```bash
git status                       # expected: clean
task setup
task check
# Expected: all green
```

- [ ] **Step 2: Scaffold and build a throwaway skill**

```bash
npx --prefix tools/ts skillsmith new e2e-demo
# Edit skills/e2e-demo/skill.json to set a real description, e.g.:
#   "description": "Use when verifying that skillsmith new + build wires up end-to-end."
task check                       # Expected: PASS once description is real
```

- [ ] **Step 3: Confirm artifacts**

```bash
cat skills/e2e-demo/SKILL.md          # has frontmatter
cat plugin.json | jq .skills           # contains e2e-demo
cat marketplace.json | jq .plugins[0]  # entry for e2e-demo
ls dist/portable/e2e-demo/             # skill.json present
# OpenAI dir absent because the scaffold defaults openai-gpt: false
```

- [ ] **Step 4: Remove the throwaway and confirm clean state**

```bash
rm -rf skills/e2e-demo
task check
# Expected: PASS; plugin.json and marketplace.json regenerated without the entry
```

- [ ] **Step 5: Final commit (only if regeneration changed anything)**

```bash
git status
# If clean: done. If not, commit the regenerated manifests.
git add -A
git commit -m "chore: regenerate manifests after e2e smoke verification"
```

---

## Self-review

**Spec coverage:**
- §3 architecture → Tasks 4–14 (spec + TS tooling), 15–19 (Python).
- §4 layout → Tasks 1–3 (root meta + `.github`), 4 (spec), 20–22 (Taskfile / manifests / docs).
- §5 schema → Task 4.
- §6 tooling → Tasks 5–14 (TS) and 15–19 (Py).
- §7 CI → Tasks 23–25.
- §8 contribution → Tasks 2, 22.
- §9 trade-offs are baked into the schema and build steps; no separate task.
- §11 success criteria → Task 26.

**Placeholder scan:** No TBD / "see Task N" / "handle errors" / "similar to" placeholders. Every code step contains the actual code.

**Type consistency:**
- `SkillForCompile` (Task 8) is consumed by tasks 8/10/11 — single shape with `id`, `raw`, `body: string`.
- `LoadedSkill` (Task 13) extends with `dir` and `bodyPath` and is passed to `buildAll` only.
- `RepoMeta` (Task 9) is widened in Task 13's `BuildOptions` to include `owner`, `repo` for the marketplace call.
- `Skill` Python dataclass (Task 16) carries `dir`, `id`, `raw`, `body` and is consumed unchanged by Tasks 18–19.
- CLI flag names match between TS (`--target`) and Python (`--all`, `--model`).

Plan is internally consistent.
