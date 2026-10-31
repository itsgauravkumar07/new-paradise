// Loads a legal page for rendering: the version saved in Admin → Legal Pages, or the built-in wording
// (lib/legal/defaults.ts) when nothing has been saved yet.
import { cache } from "react";
import { backendJson } from "@/lib/server/backend";
import { LEGAL_DEFAULTS } from "@/lib/legal/defaults";
import type { LegalKind, LegalPageData } from "@/lib/legal/types";

export const legalCacheTag = (kind: LegalKind) => `legal-page-${kind}`;

export const getLegalPage = cache(async (kind: LegalKind): Promise<LegalPageData> => {
  // A backend error is thrown (not swallowed): the last good copy of the page keeps being served,
  // rather than silently swapping the legal team's published wording for the built-in one.
  const saved = await backendJson<{ data?: LegalPageData }>(`/api/legal-pages/${kind}`, { revalidate: 300, tags: [legalCacheTag(kind)] });
  const page = saved?.data;
  if (!page || !Array.isArray(page.sections) || page.sections.length === 0) return LEGAL_DEFAULTS[kind];
  return {
    ...LEGAL_DEFAULTS[kind],
    ...page,
    kind,
    glance: Array.isArray(page.glance) ? page.glance : [],
  };
});
