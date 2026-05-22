import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { loadSkills, type LoadedSkill } from "./load.js";
import { compileClaudeSkill } from "./compile/claude-skill.js";
import {
  compileClaudePluginManifest,
  type PluginRepoMeta
} from "./compile/claude-plugin.js";
import { compileOpenAI } from "./compile/openai.js";
import { compilePortable } from "./compile/portable.js";
import { buildMarketplace, type MarketplaceRepoMeta } from "./marketplace.js";

export interface BuildOptions {
  root: string;
  repo: PluginRepoMeta & MarketplaceRepoMeta;
}

async function writeArtifact(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

function isEnabled(s: LoadedSkill, target: string): boolean {
  const targets = s.raw.targets as Record<string, { enabled?: boolean } | undefined> | undefined;
  return targets?.[target]?.enabled === true;
}

export async function buildAll(opts: BuildOptions): Promise<void> {
  const skills = await loadSkills(resolve(opts.root, "plugins"));

  for (const skill of skills) {
    if (isEnabled(skill, "claude-skill") || isEnabled(skill, "claude-plugin")) {
      const out = compileClaudeSkill(skill);
      await writeArtifact(resolve(skill.dir, out.path), out.contents);
    }
    if (isEnabled(skill, "claude-plugin")) {
      const manifest = compileClaudePluginManifest({
        skill: { id: skill.id, raw: skill.raw as unknown as SkillForPluginManifestRaw },
        repo: opts.repo
      });
      await writeArtifact(resolve(skill.dir, manifest.path), manifest.contents);
    }
    if (isEnabled(skill, "openai-gpt")) {
      for (const out of compileOpenAI(skill)) {
        await writeArtifact(resolve(opts.root, "dist", "openai", skill.id, out.path), out.contents);
      }
    }
    if (isEnabled(skill, "portable")) {
      for (const out of compilePortable(skill)) {
        await writeArtifact(resolve(opts.root, "dist", "portable", skill.id, out.path), out.contents);
      }
    }
  }

  const marketplace = buildMarketplace({
    repo: opts.repo,
    skills: skills.map(s => ({
      id: s.id,
      raw: s.raw as unknown as MarketplaceSkillRaw
    }))
  });
  await writeArtifact(
    resolve(opts.root, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(marketplace, null, 2)}\n`
  );
}

interface SkillForPluginManifestRaw {
  id: string;
  version: string;
  description: string;
  tags?: string[];
  targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } };
}

interface MarketplaceSkillRaw {
  id: string;
  version: string;
  description: string;
  tags?: string[];
  targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } };
}
