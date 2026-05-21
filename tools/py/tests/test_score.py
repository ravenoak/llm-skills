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
