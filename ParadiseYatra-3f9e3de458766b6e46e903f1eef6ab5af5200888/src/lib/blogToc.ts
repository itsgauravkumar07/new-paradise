export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const decode = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const toId = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

/**
 * Gives every <h2>/<h3> in an article an id (keeping any it already has) and returns them for a table of contents.
 * Pure string work, so the server and the browser produce the same HTML.
 */
export function withHeadingIds(html: string): { html: string; headings: TocHeading[] } {
  const used = new Map<string, number>();
  const headings: TocHeading[] = [];

  const out = html.replace(/<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (match, tag: string, attrs = "", inner: string) => {
    const text = decode(inner.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
    if (!text) return match;

    const existing = /\sid=["']([^"']+)["']/i.exec(attrs);
    let id = existing?.[1] || toId(text) || "section";
    if (!existing) {
      const seen = used.get(id) || 0;
      used.set(id, seen + 1);
      if (seen) id = `${id}-${seen + 1}`;
    }
    headings.push({ id, text, level: tag.toLowerCase() === "h2" ? 2 : 3 });
    return existing ? match : `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
  });

  return { html: out, headings };
}
