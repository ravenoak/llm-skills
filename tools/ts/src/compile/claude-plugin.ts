import type { TargetArtifact } from "./types.js";

export interface PluginAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface PluginRepoMeta {
  author: PluginAuthor;
  homepage?: string;
  repository?: string;
  license?: string;
}

export interface SkillForPluginManifest {
  id: string;
  raw: {
    id: string;
    version: string;
    description: string;
    tags?: string[];
    targets?: {
      "claude-plugin"?: { enabled?: boolean; category?: string };
    };
  };
}

export function compileClaudePluginManifest(input: {
  skill: SkillForPluginManifest;
  repo: PluginRepoMeta;
}): TargetArtifact {
  const r = input.repo;
  const s = input.skill.raw;
  const tags = s.tags;
  const manifest = {
    name: input.skill.id,
    description: s.description,
    version: s.version,
    author: r.author,
    ...(r.homepage ? { homepage: r.homepage } : {}),
    ...(r.repository ? { repository: r.repository } : {}),
    ...(r.license ? { license: r.license } : {}),
    ...(tags && tags.length > 0 ? { keywords: tags } : {})
  };
  return {
    path: ".claude-plugin/plugin.json",
    contents: `${JSON.stringify(manifest, null, 2)}\n`
  };
}
