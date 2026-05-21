import type { SkillForCompile, TargetArtifact } from "./types.js";

export function compileOpenAI(skill: SkillForCompile): TargetArtifact[] {
  const r = skill.raw as {
    name: string;
    description: string;
    targets?: {
      "openai-gpt"?: {
        conversationStarters?: string[];
        capabilities?: string[];
        actionsSchema?: string;
      };
    };
  };
  const target = r.targets?.["openai-gpt"] ?? {};
  const manifest = {
    name: r.name,
    description: r.description,
    conversationStarters: target.conversationStarters ?? [],
    capabilities: target.capabilities ?? [],
    ...(target.actionsSchema ? { actionsSchema: target.actionsSchema } : {})
  };
  return [
    { path: "manifest.json", contents: `${JSON.stringify(manifest, null, 2)}\n` },
    { path: "instructions.md", contents: skill.body.endsWith("\n") ? skill.body : `${skill.body}\n` }
  ];
}
