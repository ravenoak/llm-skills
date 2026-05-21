import { describe, expect, it } from "vitest";
import { lintDescription, lintBody } from "../src/lint.js";

describe("lintDescription", () => {
  it("flags descriptions that exceed the per-target cap", () => {
    const long = "x".repeat(1025);
    const findings = lintDescription(long, { maxLength: 1024 });
    expect(findings.some(f => f.code === "description-too-long")).toBe(true);
  });

  it("warns when description does not start with a triggering verb", () => {
    const findings = lintDescription("This is a thing.", { maxLength: 1024 });
    expect(findings.some(f => f.code === "description-weak-trigger")).toBe(true);
  });

  it("accepts a strong trigger phrase", () => {
    const findings = lintDescription("Use when refactoring TypeScript files.", { maxLength: 1024 });
    expect(findings.filter(f => f.severity === "error")).toHaveLength(0);
  });
});

describe("lintBody", () => {
  it("flags surviving placeholder tokens", () => {
    const findings = lintBody("Hello {{name}}, welcome.");
    expect(findings.some(f => f.code === "untemplated-placeholder")).toBe(true);
  });

  it("flags obvious AWS access key patterns", () => {
    const findings = lintBody("export AWS_ACCESS_KEY_ID=AKIAABCDEFGHIJKLMNOP");
    expect(findings.some(f => f.code === "possible-secret")).toBe(true);
  });
});
