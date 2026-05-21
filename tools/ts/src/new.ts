import { mkdir, writeFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const ID_RE = /^[a-z][a-z0-9-]{1,63}$/;

async function pathExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function scaffoldSkill(opts: { root: string; id: string }): Promise<void> {
  if (!ID_RE.test(opts.id)) {
    throw new Error(`invalid skill id: ${opts.id}`);
  }
  const dir = resolve(opts.root, "skills", opts.id);
  if (await pathExists(dir)) {
    throw new Error(`skill ${opts.id} already exists at ${dir}`);
  }
  await mkdir(dir, { recursive: true });

  const name = opts.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const skillJson = {
    specVersion: "1",
    id: opts.id,
    version: "0.0.1",
    name,
    description: `Use when <fill in the trigger phrase for ${opts.id}>.`,
    body: { path: "body.md" },
    targets: {
      "claude-skill": { enabled: true },
      "claude-plugin": { enabled: true },
      "openai-gpt": { enabled: false },
      "portable": { enabled: true }
    }
  };

  await writeFile(resolve(dir, "skill.json"), `${JSON.stringify(skillJson, null, 2)}\n`);
  await writeFile(
    resolve(dir, "body.md"),
    `# ${name}\n\nReplace this body with the skill instructions.\n`
  );
}
