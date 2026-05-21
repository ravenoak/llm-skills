"""Entry point for the llm-skills CLI (stubbed; real commands added later)."""

from __future__ import annotations

import click

from llm_skills import __version__


@click.group()
@click.version_option(__version__)
def main() -> None:
    """llm-skills: evaluate and draft skills."""


if __name__ == "__main__":
    main()
