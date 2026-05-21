import { describe, expect, it } from "vitest";
import { version } from "../src/cli.js";

describe("skillsmith", () => {
  it("exports a semver version string", () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/);
  });
});
