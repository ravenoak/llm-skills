import type { SkillForCompile, TargetArtifact } from "./types.js";

export function compilePortable(skill: SkillForCompile): TargetArtifact[] {
  const resolved = {
    ...skill.raw,
    body: { inline: skill.body }
  };
  return [{ path: "skill.json", contents: `${JSON.stringify(resolved, null, 2)}\n` }];
}
