import { describe, expect, it } from "vitest";
import { compileClaudeSkill } from "../src/compile/claude-skill.js";

const skill = {
  id: "demo",
  raw: {
    specVersion: "1",
    id: "demo",
    version: "0.1.0",
    name: "Demo",
    description: "Use when verifying the Claude skill compiler.",
    body: { path: "body.md" },
    targets: { "claude-skill": { enabled: true, allowedTools: ["Read", "Edit"] } }
  },
  body: "## Demo body\n\nHello.\n"
};

describe("compileClaudeSkill", () => {
  it("emits SKILL.md with frontmatter and body", () => {
    const out = compileClaudeSkill(skill);
    expect(out.path).toBe("SKILL.md");
    expect(out.contents).toContain("name: demo");
    expect(out.contents).toContain("description: Use when verifying the Claude skill compiler.");
    expect(out.contents).toContain("allowed-tools:");
    expect(out.contents).toMatch(/---\n.*\n---\n\n## Demo body/s);
  });

  it("clips a description longer than 1024 chars", () => {
    const long = "x".repeat(2000);
    const out = compileClaudeSkill({ ...skill, raw: { ...skill.raw, description: long } });
    const match = /description: (.+)\n/.exec(out.contents);
    expect(match).not.toBeNull();
    expect((match![1] as string).length).toBeLessThanOrEqual(1024);
  });
});
