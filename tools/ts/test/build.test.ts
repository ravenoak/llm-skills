import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildAll } from "../src/build.js";

let workspace: string;

beforeEach(() => {
  workspace = mkdtempSync(join(tmpdir(), "skillsmith-build-"));
  mkdirSync(join(workspace, "skills", "demo"), { recursive: true });
  writeFileSync(
    join(workspace, "skills", "demo", "skill.json"),
    JSON.stringify({
      specVersion: "1",
      id: "demo",
      version: "0.1.0",
      name: "Demo",
      description: "Use when verifying the build orchestrator end-to-end.",
      body: { path: "body.md" },
      targets: {
        "claude-skill": { enabled: true },
        "claude-plugin": { enabled: true },
        "openai-gpt": { enabled: true },
        "portable": { enabled: true }
      }
    })
  );
  writeFileSync(join(workspace, "skills", "demo", "body.md"), "Body.\n");
});

afterEach(() => rmSync(workspace, { recursive: true, force: true }));

describe("buildAll", () => {
  it("writes SKILL.md plus .claude-plugin/{plugin,marketplace}.json", async () => {
    await buildAll({
      root: workspace,
      repo: {
        name: "llm-skills",
        version: "0.0.0",
        description: "Test marketplace.",
        author: { name: "ravenoak" },
        owner: { name: "ravenoak" }
      }
    });
    const skillMd = readFileSync(join(workspace, "skills", "demo", "SKILL.md"), "utf8");
    expect(skillMd).toContain("name: demo");

    const pluginJson = JSON.parse(
      readFileSync(join(workspace, ".claude-plugin", "plugin.json"), "utf8")
    );
    expect(pluginJson.name).toBe("llm-skills");
    expect(pluginJson).not.toHaveProperty("skills");

    const openaiManifest = JSON.parse(
      readFileSync(join(workspace, "dist", "openai", "demo", "manifest.json"), "utf8")
    );
    expect(openaiManifest.name).toBe("Demo");

    const portable = JSON.parse(
      readFileSync(join(workspace, "dist", "portable", "demo", "skill.json"), "utf8")
    );
    expect(portable.body).toEqual({ inline: "Body.\n" });

    const marketplace = JSON.parse(
      readFileSync(join(workspace, ".claude-plugin", "marketplace.json"), "utf8")
    );
    expect(marketplace.name).toBe("llm-skills");
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].source).toBe("./");
  });
});
