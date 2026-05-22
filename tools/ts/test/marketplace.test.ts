import { describe, expect, it } from "vitest";
import { buildMarketplace } from "../src/marketplace.js";

describe("buildMarketplace", () => {
  it("emits one plugin entry per claude-plugin-enabled skill", () => {
    const json = buildMarketplace({
      repo: {
        marketplaceName: "ravenoak-llm-skills",
        marketplaceDescription: "Test marketplace.",
        owner: { name: "ravenoak" },
        homepage: "https://example.com",
        license: "MIT"
      },
      skills: [
        {
          id: "demo",
          raw: {
            id: "demo",
            version: "1.2.3",
            description: "Use when wiring up the marketplace.",
            tags: ["test"],
            targets: { "claude-plugin": { enabled: true, category: "developer-tools" } }
          }
        },
        {
          id: "skipped",
          raw: {
            id: "skipped",
            version: "0.0.1",
            description: "Use when we should not appear in marketplace.json.",
            targets: { "claude-plugin": { enabled: false } }
          }
        }
      ]
    });
    expect(json.name).toBe("ravenoak-llm-skills");
    expect(json.owner.name).toBe("ravenoak");
    expect(json.plugins).toHaveLength(1);
    const plugin = json.plugins[0]!;
    expect(plugin.name).toBe("demo");
    expect(plugin.version).toBe("1.2.3");
    expect(plugin.source).toBe("./plugins/demo");
    expect(plugin.category).toBe("developer-tools");
    expect(plugin.license).toBe("MIT");
    expect(plugin.keywords).toEqual(["test"]);
  });

  it("omits optional fields when absent", () => {
    const json = buildMarketplace({
      repo: {
        marketplaceName: "ravenoak-llm-skills",
        marketplaceDescription: "x",
        owner: { name: "ravenoak" }
      },
      skills: [
        {
          id: "demo",
          raw: {
            id: "demo",
            version: "0.1.0",
            description: "Use when running the bare-minimum marketplace test.",
            targets: { "claude-plugin": { enabled: true } }
          }
        }
      ]
    });
    const plugin = json.plugins[0]!;
    expect(plugin).not.toHaveProperty("homepage");
    expect(plugin).not.toHaveProperty("license");
    expect(plugin).not.toHaveProperty("keywords");
    expect(plugin).not.toHaveProperty("category");
  });
});
