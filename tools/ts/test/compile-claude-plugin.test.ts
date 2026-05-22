import { describe, expect, it } from "vitest";
import { compileClaudePluginManifest } from "../src/compile/claude-plugin.js";

describe("compileClaudePluginManifest", () => {
  it("emits .claude-plugin/plugin.json carrying skill metadata", () => {
    const out = compileClaudePluginManifest({
      skill: {
        id: "demo",
        raw: {
          id: "demo",
          version: "1.2.3",
          description: "Use when verifying plugin manifest emission.",
          tags: ["demo", "test"],
          targets: { "claude-plugin": { enabled: true } }
        }
      },
      repo: {
        author: { name: "ravenoak" },
        license: "MIT"
      }
    });
    expect(out.path).toBe(".claude-plugin/plugin.json");
    const json = JSON.parse(out.contents);
    expect(json.name).toBe("demo");
    expect(json.version).toBe("1.2.3");
    expect(json.description).toContain("plugin manifest");
    expect(json.author).toEqual({ name: "ravenoak" });
    expect(json.license).toBe("MIT");
    expect(json.keywords).toEqual(["demo", "test"]);
    expect(json).not.toHaveProperty("skills");
  });

  it("omits optional fields when absent", () => {
    const out = compileClaudePluginManifest({
      skill: {
        id: "demo",
        raw: {
          id: "demo",
          version: "0.1.0",
          description: "Use when running the bare-minimum compile test."
        }
      },
      repo: { author: { name: "ravenoak" } }
    });
    const json = JSON.parse(out.contents);
    expect(json).not.toHaveProperty("homepage");
    expect(json).not.toHaveProperty("license");
    expect(json).not.toHaveProperty("keywords");
  });
});
