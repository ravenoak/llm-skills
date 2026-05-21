import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateSkillDir } from "../src/validate.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures", "skills");

describe("validateSkillDir", () => {
  it("accepts a well-formed skill directory", async () => {
    const result = await validateSkillDir(join(fixtures, "good-skill"));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    if (result.ok) {
      expect(result.skill.id).toBe("good-skill");
    }
  });

  it("rejects when skill.id does not match directory name", async () => {
    const result = await validateSkillDir(join(fixtures, "bad-id"));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.includes("id does not match directory name"))).toBe(true);
  });

  it("rejects when the referenced body file is missing", async () => {
    const result = await validateSkillDir(join(fixtures, "good-skill"), {
      overrideBodyPath: "missing.md"
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes("missing"))).toBe(true);
  });
});
