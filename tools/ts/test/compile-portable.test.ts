import { describe, expect, it } from "vitest";
import { compilePortable } from "../src/compile/portable.js";

describe("compilePortable", () => {
  it("emits a single resolved skill.json with body inlined for distribution", () => {
    const artifacts = compilePortable({
      id: "demo",
      raw: {
        specVersion: "1",
        id: "demo",
        version: "0.1.0",
        name: "Demo",
        description: "Use when verifying the portable compiler.",
        body: { path: "body.md" }
      },
      body: "Body content.\n"
    });
    expect(artifacts).toHaveLength(1);
    const first = artifacts[0];
    expect(first).toBeDefined();
    const json = JSON.parse(first!.contents);
    expect(json.body).toEqual({ inline: "Body content.\n" });
    expect(json.specVersion).toBe("1");
  });
});
