export type Severity = "error" | "warn";
export interface Finding {
  code: string;
  severity: Severity;
  message: string;
}

const TRIGGER_STARTS = /^(use when|when |for |handles |triggers )/i;
const PLACEHOLDER = /\{\{\s*[A-Za-z0-9_.-]+\s*\}\}/;
const AWS_KEY = /\bAKIA[0-9A-Z]{16}\b/;
const GH_TOKEN = /\bghp_[A-Za-z0-9]{36}\b/;
const OPENAI_KEY = /\bsk-[A-Za-z0-9]{20,}\b/;

export function lintDescription(text: string, opts: { maxLength: number }): Finding[] {
  const findings: Finding[] = [];
  if (text.length > opts.maxLength) {
    findings.push({
      code: "description-too-long",
      severity: "error",
      message: `description length ${text.length} exceeds cap ${opts.maxLength}`
    });
  }
  if (!TRIGGER_STARTS.test(text)) {
    findings.push({
      code: "description-weak-trigger",
      severity: "warn",
      message: "description does not start with a recognized triggering verb-phrase"
    });
  }
  return findings;
}

export function lintBody(text: string): Finding[] {
  const findings: Finding[] = [];
  if (PLACEHOLDER.test(text)) {
    findings.push({
      code: "untemplated-placeholder",
      severity: "error",
      message: "body contains an untemplated {{placeholder}} token"
    });
  }
  if (AWS_KEY.test(text) || GH_TOKEN.test(text) || OPENAI_KEY.test(text)) {
    findings.push({
      code: "possible-secret",
      severity: "error",
      message: "body contains a token that matches a known secret pattern"
    });
  }
  return findings;
}
