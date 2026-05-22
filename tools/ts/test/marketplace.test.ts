import { describe, expect, it } from "vitest";
import { buildMarketplace } from "../src/marketplace.js";

describe("buildMarketplace", () => {
  it("emits a single self-referencing plugin entry", () => {
    const json = buildMarketplace({
      repo: {
        name: "llm-skills",
        version: "1.2.3",
        description: "Pluralistic reasoning skills for Claude Code.",
        owner: { name: "ravenoak" },
        license: "MIT"
      }
    });
    expect(json.name).toBe("llm-skills");
    expect(json.owner.name).toBe("ravenoak");
    expect(json.plugins).toHaveLength(1);
    const plugin = json.plugins[0]!;
    expect(plugin.name).toBe("llm-skills");
    expect(plugin.version).toBe("1.2.3");
    expect(plugin.source).toBe("./");
    expect(plugin.license).toBe("MIT");
  });

  it("omits optional fields when absent", () => {
    const json = buildMarketplace({
      repo: {
        name: "llm-skills",
        version: "0.1.0",
        description: "x",
        owner: { name: "ravenoak" }
      }
    });
    const plugin = json.plugins[0]!;
    expect(plugin).not.toHaveProperty("homepage");
    expect(plugin).not.toHaveProperty("license");
    expect(plugin).not.toHaveProperty("keywords");
  });
});
