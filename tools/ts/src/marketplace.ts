export interface MarketplaceOwner {
  name: string;
  email?: string;
  url?: string;
}

export interface MarketplaceRepoMeta {
  name: string;
  version: string;
  description: string;
  owner: MarketplaceOwner;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
}

export interface MarketplaceJson {
  name: string;
  description: string;
  owner: MarketplaceOwner;
  plugins: Array<{
    name: string;
    description: string;
    version: string;
    source: string;
    author: MarketplaceOwner;
    homepage?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
  }>;
}

export function buildMarketplace(input: {
  repo: MarketplaceRepoMeta;
}): MarketplaceJson {
  const r = input.repo;
  const plugin = {
    name: r.name,
    description: r.description,
    version: r.version,
    source: "./",
    author: r.owner,
    ...(r.homepage ? { homepage: r.homepage } : {}),
    ...(r.repository ? { repository: r.repository } : {}),
    ...(r.license ? { license: r.license } : {}),
    ...(r.keywords && r.keywords.length > 0 ? { keywords: r.keywords } : {})
  };
  return {
    name: r.name,
    description: r.description,
    owner: r.owner,
    plugins: [plugin]
  };
}
