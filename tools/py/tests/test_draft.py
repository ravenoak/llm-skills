from pathlib import Path
from typing import Any

from llm_skills.draft import DraftConfig, drafter


class _FakeClient:
    def messages_create(self, **kwargs: Any) -> str:
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
