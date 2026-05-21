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
