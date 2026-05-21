"""Run skill example fixtures through Claude (with prompt caching) and record results."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from llm_skills.loader import Skill


class _Messages(Protocol):
    def create(self, **kwargs: Any) -> Any: ...


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
    def __init__(self, client: Any, config: EvalConfig) -> None:
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
