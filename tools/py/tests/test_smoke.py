from llm_skills import __version__


def test_version_is_semver() -> None:
    parts = __version__.split(".")
    assert len(parts) >= 3
    assert all(p.split("-")[0].isdigit() for p in parts[:3])
