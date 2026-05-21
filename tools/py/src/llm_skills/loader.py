"""Load and validate llm-skills portable manifests."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import jsonschema

# parents[4] resolves to repo root: loader.py → llm_skills/ → src/ → py/ → tools/ → root
SPEC_DIR = Path(__file__).resolve().parents[4] / "spec"
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
