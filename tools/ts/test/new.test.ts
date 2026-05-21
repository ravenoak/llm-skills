import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scaffoldSkill } from "../src/new.js";

let workspace: string;
beforeEach(() => { workspace = mkdtempSync(join(tmpdir(), "skillsmith-new-")); });
afterEach(() => rmSync(workspace, { recursive: true, force: true }));

describe("scaffoldSkill", () => {
  it("creates skill.json and body.md in the right place", async () => {
    await scaffoldSkill({ root: workspace, id: "new-skill" });
    const skillJson = JSON.parse(
      readFileSync(join(workspace, "skills", "new-skill", "skill.json"), "utf8")
    );
    expect(skillJson.id).toBe("new-skill");
    expect(skillJson.specVersion).toBe("1");
    expect(existsSync(join(workspace, "skills", "new-skill", "body.md"))).toBe(true);
  });

  it("refuses to overwrite an existing skill directory", async () => {
    await scaffoldSkill({ root: workspace, id: "dup" });
    await expect(scaffoldSkill({ root: workspace, id: "dup" })).rejects.toThrow(/already exists/);
  });

  it("rejects invalid skill ids", async () => {
    await expect(scaffoldSkill({ root: workspace, id: "BadID" })).rejects.toThrow(/invalid/);
  });
});
