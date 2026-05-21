from pathlib import Path
from typing import Any, ClassVar

from llm_skills.eval import EvalConfig, EvalRunner, ExampleResult
from llm_skills.loader import Skill


class _FakeClient:
    def __init__(self) -> None:
        self.calls: list[dict[str, Any]] = []

    class _Messages:
        def __init__(self, outer: "_FakeClient") -> None:
            self.outer = outer

        def create(self, **kwargs: Any) -> Any:
            self.outer.calls.append(kwargs)

            class _Content:
                text = "ok"

            _UsageCls = type(
                "u",
                (),
                {"input_tokens": 10, "output_tokens": 5, "cache_read_input_tokens": 7},
            )

            class _Resp:
                content: ClassVar[list[_Content]] = [_Content()]
                usage: ClassVar[Any] = _UsageCls

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
