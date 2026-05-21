import type { SkillForCompile, TargetArtifact } from "./types.js";

const MAX_DESCRIPTION = 1024;

function yamlEscape(value: string): string {
  if (/[:#&*!|>'"%@`]/.test(value) || /^\s|\s$/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

export function compileClaudeSkill(skill: SkillForCompile): TargetArtifact {
  const r = skill.raw as {
    id: string;
    description: string;
    targets?: { "claude-skill"?: { allowedTools?: string[]; model?: string } };
  };
  const target = r.targets?.["claude-skill"] ?? {};
  const description = r.description.slice(0, MAX_DESCRIPTION);

  const frontmatterLines = [
    "---",
    `name: ${yamlEscape(r.id)}`,
    `description: ${yamlEscape(description)}`
  ];
  if (target.allowedTools && target.allowedTools.length > 0) {
    frontmatterLines.push(`allowed-tools: [${target.allowedTools.map(yamlEscape).join(", ")}]`);
  }
  if (target.model) {
    frontmatterLines.push(`model: ${yamlEscape(target.model)}`);
  }
  frontmatterLines.push("---", "");

  return {
    path: "SKILL.md",
    contents: `${frontmatterLines.join("\n")}\n${skill.body}`
  };
}
