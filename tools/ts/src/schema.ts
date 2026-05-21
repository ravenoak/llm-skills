import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { specDir } from "./paths.js";

export type AjvValidator = ReturnType<Ajv2020["compile"]>;

let cachedSkillValidator: AjvValidator | null = null;

export async function getSkillValidator(): Promise<AjvValidator> {
  if (cachedSkillValidator) return cachedSkillValidator;
  const schemaText = await readFile(resolve(specDir, "skill.schema.json"), "utf8");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  cachedSkillValidator = ajv.compile(JSON.parse(schemaText));
  return cachedSkillValidator;
}
