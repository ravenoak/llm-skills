import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));

function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, "spec", "skill.schema.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`could not find repo root from ${start}`);
}

export const repoRoot = findRepoRoot(here);
export const specDir = resolve(repoRoot, "spec");
export const pluginsDir = resolve(repoRoot, "plugins");
export const distDir = resolve(repoRoot, "dist");
