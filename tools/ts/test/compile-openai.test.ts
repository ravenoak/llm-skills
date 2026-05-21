import { describe, expect, it } from "vitest";
import { compileOpenAI } from "../src/compile/openai.js";

const skill = {
  id: "demo",
  raw: {
    id: "demo",
    name: "Demo",
    description: "Use when testing the OpenAI compiler.",
    targets: {
      "openai-gpt": {
        enabled: true,
        conversationStarters: ["Hi!"],
        capabilities: ["web_browsing"]
      }
    }
  },
  body: "Body content."
};

describe("compileOpenAI", () => {
  it("emits manifest.json and instructions.md", () => {
    const artifacts = compileOpenAI(skill);
    const paths = artifacts.map(a => a.path).sort();
    expect(paths).toEqual(["instructions.md", "manifest.json"]);

    const manifestArtifact = artifacts.find(a => a.path === "manifest.json");
    expect(manifestArtifact).toBeDefined();
    const manifest = JSON.parse(manifestArtifact!.contents);
    expect(manifest.name).toBe("Demo");
    expect(manifest.description).toBe("Use when testing the OpenAI compiler.");
    expect(manifest.conversationStarters).toEqual(["Hi!"]);
    expect(manifest.capabilities).toEqual(["web_browsing"]);

    const instructionsArtifact = artifacts.find(a => a.path === "instructions.md");
    expect(instructionsArtifact).toBeDefined();
    expect(instructionsArtifact!.contents).toContain("Body content.");
  });
});
