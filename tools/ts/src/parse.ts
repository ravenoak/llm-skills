import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

export interface BodyRef {
  path?: string;
  template?: string;
  vars?: Record<string, unknown>;
}

export interface ParsedSkill {
  dir: string;
  id: string;
  raw: Record<string, unknown>;
  body: BodyRef;
}

export async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function parseSkill(dir: string): Promise<ParsedSkill> {
  const raw = (await readJson(resolve(dir, "skill.json"))) as Record<string, unknown>;
  const id = String(raw["id"] ?? "");
  const body = (raw["body"] ?? {}) as BodyRef;
  return { dir, id, raw, body };
}

export function dirName(dir: string): string {
  return basename(dir);
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}
