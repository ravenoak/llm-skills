"""LLM-assisted drafting of new skill manifests and bodies."""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path


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
