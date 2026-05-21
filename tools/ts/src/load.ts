import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseSkill } from "./parse.js";

export interface LoadedSkill {
  dir: string;
  id: string;
  raw: Record<string, unknown>;
  body: string;
  bodyPath: string;
}

export async function loadSkills(skillsDir: string): Promise<LoadedSkill[]> {
  let entries: string[];
  try {
    entries = await readdir(skillsDir);
  } catch {
    return [];
  }
  const out: LoadedSkill[] = [];
  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const dir = resolve(skillsDir, name);
    const parsed = await parseSkill(dir);
    const bodyPath = parsed.body.path ?? parsed.body.template;
    if (!bodyPath) continue;
    const body = await readFile(resolve(dir, bodyPath), "utf8");
    out.push({ dir, id: parsed.id, raw: parsed.raw, body, bodyPath });
  }
  return out;
}
