import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { specDir } from "./paths.js";

export type AjvValidator = ReturnType<Ajv2020["compile"]>;

let validatorPromise: Promise<AjvValidator> | null = null;

async function compileSkillValidator(): Promise<AjvValidator> {
  const schemaText = await readFile(resolve(specDir, "skill.schema.json"), "utf8");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(JSON.parse(schemaText));
}

export function getSkillValidator(): Promise<AjvValidator> {
  if (!validatorPromise) {
    validatorPromise = compileSkillValidator().catch(err => {
      // Reset on failure so a retry can succeed (e.g., if schema file is restored).
      validatorPromise = null;
      throw err;
    });
  }
  return validatorPromise;
}
