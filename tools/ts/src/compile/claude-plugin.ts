import type { TargetArtifact } from "./types.js";

export interface RepoMeta {
  name: string;
  version: string;
  description: string;
  author: string;
}

export interface MinimalSkillForPlugin {
  id: string;
  raw: { targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } } };
}

export function compileClaudePluginManifest(input: {
  repo: RepoMeta;
  skills: MinimalSkillForPlugin[];
}): TargetArtifact {
  const enabled = input.skills.filter(
    s => s.raw.targets?.["claude-plugin"]?.enabled === true
  );
  const manifest = {
    name: input.repo.name,
    version: input.repo.version,
    description: input.repo.description,
    author: input.repo.author,
    skills: enabled.map(s => ({ source: `./skills/${s.id}` }))
  };
  return {
    path: "plugin.json",
    contents: `${JSON.stringify(manifest, null, 2)}\n`
  };
}
