// Content model for the legal pages (Privacy, Terms, Cookie, Refund). The same shape is stored by the
// backend (models/LegalPage.js), edited in Admin → Legal Pages and rendered by components/legal.
// Text fields accept a little inline formatting: **bold**, *italic* and [link text](/path or https://…).

export const LEGAL_KINDS = ["privacy", "terms", "cookie", "refund"] as const;
export type LegalKind = (typeof LEGAL_KINDS)[number];

export type LegalTone = "info" | "warning" | "success";

export interface LegalIconText {
  icon: string;
  text: string;
}

export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "note"; tone: LegalTone; icon: string; text: string }
  | { type: "cards"; columns: 2 | 3; items: { icon: string; title: string; text: string }[] }
  | { type: "chips"; items: { icon: string; label: string }[] }
  | { type: "fees"; items: { label: string; percent: number; text: string }[] }
  | { type: "steps"; items: LegalIconText[] }
  | { type: "choices"; items: LegalIconText[] }
  | { type: "contact"; title: string; subtitle: string; lines: LegalIconText[] };

export type LegalBlockType = LegalBlock["type"];

export interface LegalSectionData {
  id: string;
  title: string;
  icon: string;
  blocks: LegalBlock[];
}

export interface LegalGlanceData {
  icon: string;
  title: string;
  text: string;
}

export interface LegalPageData {
  kind: LegalKind;
  title: string;
  description: string;
  /** Date shown as "Last updated", yyyy-mm-dd */
  lastUpdated: string;
  glance: LegalGlanceData[];
  sections: LegalSectionData[];
  /** Set by the backend when the page has been saved from the admin panel */
  updatedAt?: string;
  updatedBy?: { name?: string; email?: string };
}

export const isLegalKind = (value: unknown): value is LegalKind => LEGAL_KINDS.includes(value as LegalKind);

/** "2026-03-02" → "2 March 2026" */
export const formatLegalDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** Section anchor from its title: "Your Rights & Choices" → "your-rights-choices" */
export const legalSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "section";
