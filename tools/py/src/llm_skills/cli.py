"""Entry point for the llm-skills CLI."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import click

from llm_skills import __version__
from llm_skills.eval import EvalConfig, EvalRunner
from llm_skills.loader import LoadError, load_skill
from llm_skills.score import score_description

REPO_ROOT = Path(__file__).resolve().parents[4]
SKILLS_DIR = REPO_ROOT / "skills"
REPORTS_DIR = REPO_ROOT / "dist" / "reports"


def _anthropic_client() -> Any:
    try:
        from anthropic import Anthropic
    except ImportError as e:  # pragma: no cover
        raise click.ClickException("anthropic SDK not installed") from e
    return Anthropic()


@click.group()
@click.version_option(__version__)
def main() -> None:
    """llm-skills CLI."""


def _resolve_targets(skill_id: str | None, all_: bool) -> list[Path]:
    if all_:
        return sorted(p for p in SKILLS_DIR.iterdir() if p.is_dir()) if SKILLS_DIR.exists() else []
    if skill_id is None:
        raise click.UsageError("provide a skill id or pass --all")
    return [SKILLS_DIR / skill_id]


@main.command("eval")
@click.argument("skill_id", required=False)
@click.option("--all", "all_", is_flag=True, help="evaluate every skill that declares examples")
@click.option("--model", default="claude-sonnet-4-6", show_default=True)
def eval_cmd(skill_id: str | None, all_: bool, model: str) -> None:
    """Run example fixtures through the model and write reports."""
    targets = _resolve_targets(skill_id, all_)
    if not targets:
        raise click.ClickException("no skills to evaluate")

    client = _anthropic_client()
    runner = EvalRunner(client=client, config=EvalConfig(model=model))
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    for d in targets:
        try:
            skill = load_skill(d)
        except LoadError as e:
            raise click.ClickException(str(e)) from e
        results = runner.run(skill)
        stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
        out = REPORTS_DIR / f"{skill.id}-{stamp}.json"
        out.write_text(
            json.dumps([r.__dict__ for r in results], indent=2) + "\n",
            encoding="utf-8",
        )
        click.echo(f"wrote {out}")


@main.command()
@click.argument("skill_id")
def score(skill_id: str) -> None:
    """Print static heuristics for a skill description."""
    skill = load_skill(SKILLS_DIR / skill_id)
    findings = score_description(skill.raw["description"])
    if not findings:
        click.echo(f"{skill_id}: ok")
        return
    for f in findings:
        click.echo(f"{f.severity.upper()} {skill_id}: {f.code} — {f.message}")


@main.command()
@click.argument("topic")
@click.option("--id", "skill_id", required=True, help="new skill id")
@click.option("--model", default="claude-sonnet-4-6", show_default=True)
def draft(topic: str, skill_id: str, model: str) -> None:
    """Use an LLM to draft skill.json + body.md from a topic."""
    from llm_skills.draft import DraftConfig, drafter

    client = _anthropic_client()

    def call(**kwargs: Any) -> str:
        resp = client.messages.create(
            model=kwargs["model"],
            max_tokens=kwargs["max_tokens"],
            system=kwargs["system"],
            messages=[{"role": "user", "content": kwargs["user"]}],
        )
        return resp.content[0].text if resp.content else ""

    out_dir = SKILLS_DIR / skill_id
    drafter(topic=topic, out_dir=out_dir, client_call=call, config=DraftConfig(model=model))
    click.echo(f"drafted skill at {out_dir}")


if __name__ == "__main__":
    main()
