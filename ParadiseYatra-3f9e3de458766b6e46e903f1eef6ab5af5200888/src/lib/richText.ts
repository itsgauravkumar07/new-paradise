const EMPTY_PARAGRAPH_REGEX = /<p(\s[^>]*)?>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi;

const appendClassAttribute = (attributes = "", className: string) => {
  if (/class\s*=/.test(attributes)) {
    return attributes.replace(
      /class=(['"])(.*?)\1/i,
      (_match, quote, currentClasses) =>
        `class=${quote}${currentClasses} ${className}${quote}`
    );
  }

  return `${attributes} class="${className}"`;
};

export const preserveRichTextSpacing = (html?: string | null): string => {
  if (!html) {
    return "";
  }

  return html.replace(EMPTY_PARAGRAPH_REGEX, (_match, attributes = "") => {
    const nextAttributes = appendClassAttribute(attributes, "editor-spacer");
    return `<p${nextAttributes}><br /></p>`;
  });
};

const BLOCK_TAGS =
  "(?:ul|ol|h[1-6]|div|table|thead|tbody|tfoot|tr|td|th|figure|blockquote|section|article)";

const BLOCK_OPEN_RE = new RegExp(
  `<p[^>]*>\\s*(<${BLOCK_TAGS}\\b[^>]*>)`,
  "gi"
);
const BLOCK_CLOSE_RE = new RegExp(`</(${BLOCK_TAGS})>\\s*</p>`, "gi");
const IMG_WRAPPED_RE = /<p[^>]*>\s*(<img\b[^>]*>)\s*<\/p>/gi;

export const normalizeRichTextHtml = (html?: string | null): string => {
  if (!html) {
    return "";
  }

  const withSpacing = preserveRichTextSpacing(html);
  return withSpacing
    .replace(BLOCK_OPEN_RE, "$1")
    .replace(BLOCK_CLOSE_RE, "</$1>")
    .replace(IMG_WRAPPED_RE, "$1");
};
