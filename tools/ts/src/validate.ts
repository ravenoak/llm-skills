import { resolve } from "node:path";
import { createRequire } from "node:module";
import { getSkillValidator } from "./schema.js";
import { dirName, parseSkill, pathExists } from "./parse.js";

const require = createRequire(import.meta.url);
const spdxIds = require("spdx-license-ids") as string[];
const SPDX = new Set(spdxIds);

export interface ValidationOptions {
  overrideBodyPath?: string;
}

export type ValidationResult =
  | { ok: true; skill: { id: string; dir: string }; errors: [] }
  | { ok: false; errors: string[] };

export async function validateSkillDir(
  dir: string,
  opts: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = [];

  let skill;
  try {
    skill = await parseSkill(dir);
  } catch (e) {
    return { ok: false, errors: [`failed to parse skill.json in ${dir}: ${(e as Error).message}`] };
  }

  const validate = await getSkillValidator();
  if (!validate(skill.raw)) {
    for (const err of validate.errors ?? []) {
      errors.push(`schema: ${err.instancePath || "/"} ${err.message ?? "invalid"}`);
    }
  }

  if (skill.id !== dirName(dir)) {
    errors.push(`id does not match directory name: "${skill.id}" vs "${dirName(dir)}"`);
  }

  const license = (skill.raw["license"] as string | undefined) ?? "MIT";
  if (!SPDX.has(license)) {
    errors.push(`license "${license}" is not a recognized SPDX identifier`);
  }

  const bodyPath = opts.overrideBodyPath ?? skill.body.path ?? skill.body.template;
  if (bodyPath) {
    const resolved = resolve(dir, bodyPath);
    if (!(await pathExists(resolved))) {
      errors.push(`body file missing: ${bodyPath}`);
    }
  } else {
    errors.push("body must specify either path or template");
  }

  if (errors.length === 0) {
    return { ok: true, skill: { id: skill.id, dir }, errors: [] };
  }
  return { ok: false, errors };
}
