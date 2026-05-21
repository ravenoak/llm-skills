import { describe, expect, it } from "vitest";
import { buildMarketplace } from "../src/marketplace.js";

describe("buildMarketplace", () => {
  it("emits an entry per skill with claude-plugin enabled", () => {
    const json = buildMarketplace({
      repo: { owner: "ravenoak", repo: "llm-skills" },
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
    expect(json.plugins).toHaveLength(1);
    const first = json.plugins[0];
    expect(first).toBeDefined();
    expect(first!.name).toBe("demo");
    expect(first!.source).toBe("./skills/demo");
    expect(first!.category).toBe("developer-tools");
  });
});
