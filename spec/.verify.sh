#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npx --yes ajv-cli@5 compile -s skill.schema.json --spec=draft2020 --validate-formats=false
npx --yes ajv-cli@5 compile -s marketplace-entry.schema.json --spec=draft2020 --validate-formats=false
npx --yes ajv-cli@5 validate -s skill.schema.json --spec=draft2020 --validate-formats=false -d examples/minimal-skill/skill.json
echo "spec: ok"
