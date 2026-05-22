# Governance

## Branch protection (manual setup)

On GitHub: Settings → Branches → main → require:

- `validate.yml / ts-check`
- `validate.yml / py-check`
- `validate.yml / schema-check`
- `validate.yml / security`
- 1 approving review
- Signed commits

## Release process

1. Update `[Unreleased]` to `[X.Y.Z] — YYYY-MM-DD` in `CHANGELOG.md`.
2. Bump versions in `tools/ts/package.json` and `tools/py/pyproject.toml` if they changed.
3. `git tag vX.Y.Z && git push --tags`.
4. The `release.yml` workflow handles GitHub Release, npm publish, and PyPI publish.

## Versioning

- Spec (`specVersion`): major bump triggers a major repo release.
- Tools: independent semver.
- Skills: independent semver per skill.
