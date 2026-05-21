import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export interface CheckResult {
  clean: boolean;
  diff: string;
}

export function gitDiffClean(root: string): CheckResult {
  try {
    execFileSync("git", ["diff", "--exit-code", "--", "."], { cwd: resolve(root), stdio: "pipe" });
    return { clean: true, diff: "" };
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer };
    const diff = (err.stdout?.toString() ?? "") + (err.stderr?.toString() ?? "");
    return { clean: false, diff };
  }
}
