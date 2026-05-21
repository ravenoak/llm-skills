import { describe, expect, it } from "vitest";
import { compileClaudePluginManifest } from "../src/compile/claude-plugin.js";

describe("compileClaudePluginManifest", () => {
  it("emits a plugin.json combining repo metadata and enabled skills", () => {
    const out = compileClaudePluginManifest({
      repo: { name: "llm-skills", version: "0.0.0", description: "test", author: "ravenoak" },
      skills: [
        { id: "demo", raw: { targets: { "claude-plugin": { enabled: true } } } }
      ]
    });
    expect(out.path).toBe("plugin.json");
    const json = JSON.parse(out.contents);
    expect(json.name).toBe("llm-skills");
    expect(json.skills).toEqual([{ source: "./skills/demo" }]);
  });

  it("omits skills that opt out of claude-plugin", () => {
    const out = compileClaudePluginManifest({
      repo: { name: "llm-skills", version: "0.0.0", description: "test", author: "ravenoak" },
      skills: [
        { id: "demo", raw: { targets: { "claude-plugin": { enabled: false } } } },
        { id: "other", raw: { targets: { "claude-plugin": { enabled: true } } } }
      ]
    });
    const json = JSON.parse(out.contents);
    expect(json.skills).toEqual([{ source: "./skills/other" }]);
  });
});
