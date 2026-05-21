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
