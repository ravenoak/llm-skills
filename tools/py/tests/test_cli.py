from click.testing import CliRunner

from llm_skills.cli import main


def test_help_lists_subcommands() -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    for cmd in ("eval", "score", "draft"):
        assert cmd in result.output
