import { describe, expect, it } from "vitest";
import { compileClaudePluginManifest } from "../src/compile/claude-plugin.js";

describe("compileClaudePluginManifest", () => {
  it("emits .claude-plugin/plugin.json with repo metadata", () => {
    const out = compileClaudePluginManifest({
      repo: {
        name: "llm-skills",
        version: "1.2.3",
        description: "Pluralistic reasoning skills.",
        author: { name: "ravenoak" },
        license: "MIT"
      }
    });
    expect(out.path).toBe(".claude-plugin/plugin.json");
    const json = JSON.parse(out.contents);
    expect(json.name).toBe("llm-skills");
    expect(json.version).toBe("1.2.3");
    expect(json.license).toBe("MIT");
    expect(json).not.toHaveProperty("skills");
  });

  it("omits optional fields when absent", () => {
    const out = compileClaudePluginManifest({
      repo: {
        name: "llm-skills",
        version: "0.1.0",
        description: "x",
        author: { name: "ravenoak" }
      }
    });
    const json = JSON.parse(out.contents);
    expect(json).not.toHaveProperty("homepage");
    expect(json).not.toHaveProperty("license");
    expect(json).not.toHaveProperty("keywords");
  });
});
