export interface MarketplaceRepo {
  owner: string;
  repo: string;
}

export interface MarketplaceSkill {
  id: string;
  raw: {
    id: string;
    version: string;
    description: string;
    tags?: string[];
    targets?: { "claude-plugin"?: { enabled?: boolean; category?: string } };
  };
}

export interface MarketplaceJson {
  owner: string;
  repo: string;
  plugins: Array<{
    name: string;
    source: string;
    description: string;
    version: string;
    category?: string;
    tags?: string[];
  }>;
}

export function buildMarketplace(input: {
  repo: MarketplaceRepo;
  skills: MarketplaceSkill[];
}): MarketplaceJson {
  const plugins = input.skills
    .filter(s => s.raw.targets?.["claude-plugin"]?.enabled === true)
    .map(s => {
      const category = s.raw.targets?.["claude-plugin"]?.category;
      return {
        name: s.id,
        source: `./skills/${s.id}`,
        description: s.raw.description,
        version: s.raw.version,
        ...(category ? { category } : {}),
        ...(s.raw.tags && s.raw.tags.length > 0 ? { tags: s.raw.tags } : {})
      };
    });
  return { owner: input.repo.owner, repo: input.repo.repo, plugins };
}
