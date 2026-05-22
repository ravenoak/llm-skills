import { Command } from "commander";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadSkills } from "./load.js";
import { validateSkillDir } from "./validate.js";
import { lintBody, lintDescription } from "./lint.js";
import { buildAll } from "./build.js";
import { gitDiffClean } from "./check.js";
import { scaffoldSkill } from "./new.js";
import { repoRoot } from "./paths.js";

export const version = "0.1.0";

const MARKETPLACE_NAME = "ravenoak-llm-skills";
const MARKETPLACE_DESCRIPTION =
  "Pluralistic, multi-disciplinary reasoning skills for Claude Code.";

interface RepoMeta {
  marketplaceName: string;
  marketplaceDescription: string;
  owner: { name: string; email?: string };
  author: { name: string; email?: string };
  homepage?: string;
  repository?: string;
  license?: string;
}

function readRepoMeta(): RepoMeta {
  const owner = { name: "ravenoak" };
  return {
    marketplaceName: MARKETPLACE_NAME,
    marketplaceDescription: MARKETPLACE_DESCRIPTION,
    owner,
    author: owner,
    homepage: "https://github.com/ravenoak/llm-skills",
    repository: "https://github.com/ravenoak/llm-skills",
    license: "MIT"
  };
}

async function runValidate(root: string): Promise<number> {
  const skills = await loadSkills(resolve(root, "plugins"));
  let failed = 0;
  for (const s of skills) {
    const r = await validateSkillDir(s.dir);
    if (!r.ok) {
      console.error(`✗ ${s.id}`);
      for (const e of r.errors) console.error(`  ${e}`);
      failed++;
    } else {
      console.log(`✓ ${s.id}`);
    }
  }
  return failed === 0 ? 0 : 1;
}

async function runLint(root: string): Promise<number> {
  const skills = await loadSkills(resolve(root, "plugins"));
  let errors = 0;
  for (const s of skills) {
    const desc = (s.raw["description"] as string | undefined) ?? "";
    const findings = [...lintDescription(desc, { maxLength: 1024 }), ...lintBody(s.body)];
    for (const f of findings) {
      const tag = f.severity === "error" ? "ERR" : "WARN";
      const line = `${tag} ${s.id}: ${f.code} — ${f.message}`;
      if (f.severity === "error") {
        console.error(line);
        errors++;
      } else {
        console.warn(line);
      }
    }
  }
  return errors === 0 ? 0 : 1;
}

async function runBuild(root: string): Promise<number> {
  await buildAll({ root, repo: readRepoMeta() });
  return 0;
}

async function runCheck(root: string): Promise<number> {
  if ((await runValidate(root)) !== 0) return 1;
  if ((await runLint(root)) !== 0) return 1;
  if ((await runBuild(root)) !== 0) return 1;
  const { clean, diff } = gitDiffClean(root);
  if (!clean) {
    console.error("✗ git working tree is dirty after build — commit regenerated artifacts:");
    console.error(diff);
    return 1;
  }
  console.log("✓ check passed");
  return 0;
}

export async function main(): Promise<number> {
  const program = new Command();
  program.name("skillsmith").version(version).description("Build and validate llm-skills");
  let exitCode = 0;

  program.command("validate").action(async () => {
    exitCode = await runValidate(repoRoot);
  });
  program.command("lint").action(async () => {
    exitCode = await runLint(repoRoot);
  });
  program.command("build").action(async () => {
    exitCode = await runBuild(repoRoot);
  });
  program.command("check").action(async () => {
    exitCode = await runCheck(repoRoot);
  });
  program
    .command("new <id>")
    .description("scaffold a new skill plugin")
    .action(async (id: string) => {
      try {
        await scaffoldSkill({ root: repoRoot, id });
        console.log(`Created plugins/${id}/skill.json and body.md`);
      } catch (e) {
        console.error(`✗ ${(e as Error).message}`);
        exitCode = 1;
      }
    });

  await program.parseAsync();
  return exitCode;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  void main().then(code => process.exit(code));
}
