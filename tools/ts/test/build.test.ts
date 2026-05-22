import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildAll } from "../src/build.js";

let workspace: string;

beforeEach(() => {
  workspace = mkdtempSync(join(tmpdir(), "skillsmith-build-"));
  mkdirSync(join(workspace, "plugins", "demo"), { recursive: true });
  writeFileSync(
    join(workspace, "plugins", "demo", "skill.json"),
    JSON.stringify({
      specVersion: "1",
      id: "demo",
      version: "0.1.0",
      name: "Demo",
      description: "Use when verifying the build orchestrator end-to-end.",
      tags: ["demo"],
      body: { path: "body.md" },
      targets: {
        "claude-skill": { enabled: true },
        "claude-plugin": { enabled: true, category: "developer-tools" },
        "openai-gpt": { enabled: true },
        "portable": { enabled: true }
      }
    })
  );
  writeFileSync(join(workspace, "plugins", "demo", "body.md"), "Body.\n");
});

afterEach(() => rmSync(workspace, { recursive: true, force: true }));

describe("buildAll", () => {
  it("writes per-plugin .claude-plugin/plugin.json and nested skills/<id>/SKILL.md", async () => {
    await buildAll({
      root: workspace,
      repo: {
        marketplaceName: "ravenoak-llm-skills",
        marketplaceDescription: "Test marketplace.",
        author: { name: "ravenoak" },
        owner: { name: "ravenoak" }
      }
    });

    // SKILL.md lives under skills/<id>/ inside the plugin dir
    const skillMd = readFileSync(
      join(workspace, "plugins", "demo", "skills", "demo", "SKILL.md"),
      "utf8"
    );
    expect(skillMd).toContain("name: demo");

    // No SKILL.md at the plugin root
    expect(existsSync(join(workspace, "plugins", "demo", "SKILL.md"))).toBe(false);

    // Per-plugin manifest at .claude-plugin/plugin.json
    const pluginJson = JSON.parse(
      readFileSync(
        join(workspace, "plugins", "demo", ".claude-plugin", "plugin.json"),
        "utf8"
      )
    );
    expect(pluginJson.name).toBe("demo");
    expect(pluginJson.version).toBe("0.1.0");
    expect(pluginJson.keywords).toEqual(["demo"]);
    expect(pluginJson).not.toHaveProperty("skills");

    const openaiManifest = JSON.parse(
      readFileSync(join(workspace, "dist", "openai", "demo", "manifest.json"), "utf8")
    );
    expect(openaiManifest.name).toBe("Demo");

    const portable = JSON.parse(
      readFileSync(join(workspace, "dist", "portable", "demo", "skill.json"), "utf8")
    );
    expect(portable.body).toEqual({ inline: "Body.\n" });

    // Marketplace lists each skill as its own plugin entry
    const marketplace = JSON.parse(
      readFileSync(join(workspace, ".claude-plugin", "marketplace.json"), "utf8")
    );
    expect(marketplace.name).toBe("ravenoak-llm-skills");
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].name).toBe("demo");
    expect(marketplace.plugins[0].source).toBe("./plugins/demo");
    expect(marketplace.plugins[0].category).toBe("developer-tools");
  });
});
