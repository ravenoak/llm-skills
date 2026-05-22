# Target: claude-plugin

Assembles the root `plugin.json` from repo metadata and the set of skills whose `targets.claude-plugin.enabled === true`.

Skill-bundled commands, agents, and hooks (placed under `skills/<id>/overrides/claude-plugin/{commands,agents,hooks}/`) are merged into root-level directories during build.

`marketplace.json` is the marketplace index: one entry per `claude-plugin`-enabled skill. Always generated; never hand-edited.
