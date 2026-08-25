/** Consent documents tracked with explicit versions (PDPL + disclaimer defense). */
export const CONSENT_DOCUMENTS = {
  terms: { version: 1 },
  privacy: { version: 1 },
  disclaimer: { version: 1 },
} as const;

export type ConsentDocKey = keyof typeof CONSENT_DOCUMENTS;

export type LocalConsentRecord = {
  doc: ConsentDocKey;
  version: number;
  accepted_at: string;
};

const LS_KEY = "haqqi_consents_v1";

export function readLocalConsents(): LocalConsentRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as LocalConsentRecord[];
  } catch {
    return [];
  }
}

export function writeLocalConsents(records: LocalConsentRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

export async function recordAllConsents(authed: boolean): Promise<void> {
  const now = new Date().toISOString();
  const records: LocalConsentRecord[] = (
    Object.keys(CONSENT_DOCUMENTS) as ConsentDocKey[]
  ).map((doc) => ({ doc, version: CONSENT_DOCUMENTS[doc].version, accepted_at: now }));

  writeLocalConsents([...readLocalConsents(), ...records]);

  if (!authed) return;
  try {
    await fetch("/api/consents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docs: records }),
    });
  } catch {
    // local record still exists; server sync retried on next login
  }
}
