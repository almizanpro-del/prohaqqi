/**
 * PII handling before external LLM calls (PDPL-aligned).
 *
 * POLICY (must hold for every AI provider call — Grok/Gemini/etc.):
 *  1. A signed Data Processing Agreement (DPA) with the provider is REQUIRED
 *     before any real user content leaves the platform.
 *  2. Only the minimum fields needed for the task are sent ("safe fields").
 *  3. Free text is scrubbed through scrubText() to strip direct identifiers.
 *  4. Nothing is sent without the user's explicit AI consent flag.
 *  5. The exact payload shape per feature is documented below and reviewed
 *     by the legal advisor quarterly.
 */

export const PII_POLICY_VERSION = 1;

export const DPA_CHECKLIST = [
  "Signed Data Processing Agreement with the model provider",
  "Provider region / data residency confirmed and recorded",
  "Zero-retention (or ≤30d) setting enabled on provider account",
  "Payload whitelist for each AI feature reviewed by legal advisor",
  "User's 'ai_processing' consent flag verified true at call time",
  "Prompt + response logged WITHOUT identifiers (audit_logs only)",
] as const;

/** Fields considered safe to send to an LLM (no direct identifiers). */
const SAFE_FIELD_WHITELIST = new Set([
  "accident_date",
  "injuries",
  "other_party_insured",
  "police_report_done",
  "claim_amount_band",
  "issue_types",
  "outcome_stage",
  "language",
  "document_kind",
]);

export type RedactionResult = {
  text: string;
  redactions: string[];
};

/** Strip direct identifiers from free text before it reaches any model. */
export function scrubText(input: string): RedactionResult {
  const redactions: string[] = [];
  let text = input;

  const rules: Array<[RegExp, string, string]> = [
    [/[\w.+-]+@[\w-]+\.[\w.]+/g, "[بريد محذوف/email]", "email"],
    [/(?:\+?962|00962|0)\s?7[789]\d(?:\s?\d){6,7}\b/g, "[هاتف محذوف/phone]", "phone"],
    [/\b\d{9,10}\b/g, "[رقم هوية محذوف/id]", "national-id"],
    [
      /\b\d{1,4}[\u0660-\u0669]*\s?(?:-|–)\s?[A-Z\u0621-\u064A]{1,4}\d{1,5}\b/g,
      "[لوحة محذوف/plate]",
      "license-plate",
    ],
    [/\b(?:JOD|JD)\s?\d[\d,.]*\b|\b\d[\d,]*(?:\.\d{1,3})?\s?(?:د\.?أ|دينار)\b/gi, "[مبلغ/amount]", "amount"],
  ];

  for (const [re, replacement, label] of rules) {
    if (re.test(text)) {
      redactions.push(label);
      text = text.replace(re, replacement);
    }
  }
  return { text, redactions };
}

/**
 * Build a minimal, identifier-free payload from a structured case object.
 * Unknown keys are dropped; whitelisted values are stringified as-is.
 */
export function buildSafeAiPayload(
  source: Record<string, unknown>
): { payload: Record<string, unknown>; droppedKeys: string[] } {
  const payload: Record<string, unknown> = {};
  const droppedKeys: string[] = [];
  for (const [k, v] of Object.entries(source)) {
    if (!SAFE_FIELD_WHITELIST.has(k)) {
      droppedKeys.push(k);
      continue;
    }
    payload[k] = v;
  }
  return { payload, droppedKeys };
}

/**
 * The ONLY sanctioned entry point for Phase-2 AI calls.
 * Throws if the mandatory preconditions are not met so a violation cannot
 * ship silently.
 */
export function prepareLlmCall(args: {
  userConsentedToAi: boolean;
  dpaOnFile: boolean;
  structured: Record<string, unknown>;
  freeText?: string;
}): { payload: Record<string, unknown>; notes: string[] } {
  if (!args.dpaOnFile) throw new Error("PII_POLICY: no DPA on file with the AI provider");
  if (!args.userConsentedToAi)
    throw new Error("PII_POLICY: user has not consented to AI processing");

  const { payload } = buildSafeAiPayload(args.structured);
  const notes: string[] = [];
  if (args.freeText) {
    const { text, redactions } = scrubText(args.freeText);
    payload.context_text = text;
    if (redactions.length) notes.push(`redacted: ${redactions.join(", ")}`);
  }
  return { payload, notes };
}
