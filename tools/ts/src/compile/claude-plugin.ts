import type { TargetArtifact } from "./types.js";

export interface PluginAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface RepoMeta {
  name: string;
  version: string;
  description: string;
  author: PluginAuthor;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
}

export function compileClaudePluginManifest(input: {
  repo: RepoMeta;
}): TargetArtifact {
  const r = input.repo;
  const manifest = {
    name: r.name,
    description: r.description,
    version: r.version,
    author: r.author,
    ...(r.homepage ? { homepage: r.homepage } : {}),
    ...(r.repository ? { repository: r.repository } : {}),
    ...(r.license ? { license: r.license } : {}),
    ...(r.keywords && r.keywords.length > 0 ? { keywords: r.keywords } : {})
  };
  return {
    path: ".claude-plugin/plugin.json",
    contents: `${JSON.stringify(manifest, null, 2)}\n`
  };
}
