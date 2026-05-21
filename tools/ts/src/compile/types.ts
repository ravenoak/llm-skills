export interface SkillForCompile {
  id: string;
  raw: Record<string, unknown>;
  body: string;
}

export interface TargetArtifact {
  path: string;
  contents: string;
}
