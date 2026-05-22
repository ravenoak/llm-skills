export interface MarketplaceOwner {
  name: string;
  email?: string;
  url?: string;
}

export interface MarketplaceRepoMeta {
  marketplaceName: string;
  marketplaceDescription: string;
  owner: MarketplaceOwner;
  homepage?: string;
  repository?: string;
  license?: string;
}

export interface MarketplaceSkill {
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

export interface MarketplacePlugin {
  name: string;
  description: string;
  version: string;
  source: string;
  author: MarketplaceOwner;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  category?: string;
}

export interface MarketplaceJson {
  name: string;
  description: string;
  owner: MarketplaceOwner;
  plugins: MarketplacePlugin[];
}

export function buildMarketplace(input: {
  repo: MarketplaceRepoMeta;
  skills: MarketplaceSkill[];
}): MarketplaceJson {
  const r = input.repo;
  const plugins: MarketplacePlugin[] = input.skills
    .filter(s => s.raw.targets?.["claude-plugin"]?.enabled === true)
    .map(s => {
      const category = s.raw.targets?.["claude-plugin"]?.category;
      const tags = s.raw.tags;
      return {
        name: s.id,
        description: s.raw.description,
        version: s.raw.version,
        source: `./plugins/${s.id}`,
        author: r.owner,
        ...(r.homepage ? { homepage: r.homepage } : {}),
        ...(r.repository ? { repository: r.repository } : {}),
        ...(r.license ? { license: r.license } : {}),
        ...(tags && tags.length > 0 ? { keywords: tags } : {}),
        ...(category ? { category } : {})
      };
    });
  return {
    name: r.marketplaceName,
    description: r.marketplaceDescription,
    owner: r.owner,
    plugins
  };
}
