const LegalPage = require("../models/LegalPage");
const LegalPageRevision = require("../models/LegalPageRevision");

const { LEGAL_KINDS } = LegalPage;
const MAX_REVISIONS = 50; // per page

// Limits keep one save from storing something absurd; real policies are far below them
const LIMITS = { sections: 40, blocks: 40, items: 30, glance: 8, text: 5000, short: 200 };

const BLOCK_TYPES = ["paragraph", "heading", "list", "note", "cards", "chips", "fees", "steps", "choices", "contact"];
const TONES = ["info", "warning", "success"];

class ValidationError extends Error {}

const str = (value, max = LIMITS.text) => (typeof value === "string" ? value.replace(/\r\n/g, "\n").trim().slice(0, max) : "");
const icon = (value) => (typeof value === "string" && /^[A-Za-z0-9]{1,40}$/.test(value) ? value : "");
const list = (value) => (Array.isArray(value) ? value.slice(0, LIMITS.items) : []);
const slug = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const iconTexts = (items) => list(items).map((i) => ({ icon: icon(i?.icon), text: str(i?.text) })).filter((i) => i.text);

// Returns a clean block, or null when it is empty or of an unknown type
const sanitizeBlock = (block) => {
  const type = block?.type;
  if (!BLOCK_TYPES.includes(type)) return null;
  switch (type) {
    case "paragraph":
    case "heading": {
      const text = str(block.text, type === "heading" ? LIMITS.short : LIMITS.text);
      return text ? { type, text } : null;
    }
    case "list": {
      const items = list(block.items).map((t) => str(t)).filter(Boolean);
      return items.length ? { type, items } : null;
    }
    case "note": {
      const text = str(block.text);
      return text ? { type, tone: TONES.includes(block.tone) ? block.tone : "info", icon: icon(block.icon), text } : null;
    }
    case "cards": {
      const items = list(block.items)
        .map((i) => ({ icon: icon(i?.icon), title: str(i?.title, LIMITS.short), text: str(i?.text) }))
        .filter((i) => i.title || i.text);
      return items.length ? { type, columns: block.columns === 3 ? 3 : 2, items } : null;
    }
    case "chips": {
      const items = list(block.items).map((i) => ({ icon: icon(i?.icon), label: str(i?.label, LIMITS.short) })).filter((i) => i.label);
      return items.length ? { type, items } : null;
    }
    case "fees": {
      const items = list(block.items)
        .map((i) => ({ label: str(i?.label, LIMITS.short), percent: Math.min(100, Math.max(0, Math.round(Number(i?.percent) || 0))), text: str(i?.text) }))
        .filter((i) => i.label || i.text);
      return items.length ? { type, items } : null;
    }
    case "steps":
    case "choices": {
      const items = iconTexts(block.items);
      return items.length ? { type, items } : null;
    }
    case "contact": {
      const title = str(block.title, LIMITS.short);
      const lines = iconTexts(block.lines);
      return title || lines.length ? { type, title, subtitle: str(block.subtitle, LIMITS.short), lines } : null;
    }
    default:
      return null;
  }
};

const sanitizeLegalPage = (body) => {
  const title = str(body?.title, LIMITS.short);
  if (!title) throw new ValidationError("The page title is required.");

  const lastUpdated = str(body?.lastUpdated, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastUpdated) || Number.isNaN(new Date(`${lastUpdated}T00:00:00Z`).getTime())) {
    throw new ValidationError("Please set a valid 'Last updated' date.");
  }

  const rawSections = Array.isArray(body?.sections) ? body.sections : [];
  if (rawSections.length > LIMITS.sections) throw new ValidationError(`A page can have at most ${LIMITS.sections} sections.`);

  const usedIds = new Set();
  const sections = rawSections.map((section, index) => {
    const sectionTitle = str(section?.title, LIMITS.short);
    if (!sectionTitle) throw new ValidationError(`Section ${index + 1} needs a title.`);
    const blocks = (Array.isArray(section?.blocks) ? section.blocks.slice(0, LIMITS.blocks) : []).map(sanitizeBlock).filter(Boolean);
    if (!blocks.length) throw new ValidationError(`Section "${sectionTitle}" has no content.`);
    // Anchors (#scope, #rights …) stay stable when a title is reworded, and are unique on the page
    let id = slug(section?.id) || slug(sectionTitle) || `section-${index + 1}`;
    for (let n = 2; usedIds.has(id); n++) id = `${slug(section?.id) || slug(sectionTitle)}-${n}`;
    usedIds.add(id);
    return { id, title: sectionTitle, icon: icon(section?.icon), blocks };
  });
  if (!sections.length) throw new ValidationError("A page needs at least one section.");

  const glance = (Array.isArray(body?.glance) ? body.glance.slice(0, LIMITS.glance) : [])
    .map((g) => ({ icon: icon(g?.icon), title: str(g?.title, LIMITS.short), text: str(g?.text, 400) }))
    .filter((g) => g.title || g.text);

  return { title, description: str(body?.description, 600), lastUpdated, glance, sections };
};

const toJson = (doc, { includeEditor = false } = {}) => ({
  kind: doc.kind,
  title: doc.title,
  description: doc.description,
  lastUpdated: doc.lastUpdated,
  glance: doc.glance,
  sections: doc.sections,
  updatedAt: doc.updatedAt,
  ...(includeEditor ? { updatedBy: { name: doc.updatedBy?.name, email: doc.updatedBy?.email } } : {}),
});

const checkKind = (req, res) => {
  if (LEGAL_KINDS.includes(req.params.kind)) return true;
  res.status(404).json({ success: false, message: "Unknown legal page." });
  return false;
};

// GET /api/legal-pages/:kind (public): 404 until the page has been saved from the admin panel
const getLegalPage = async (req, res) => {
  try {
    if (!checkKind(req, res)) return;
    const doc = await LegalPage.findOne({ kind: req.params.kind }).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not saved yet." });
    res.json({ success: true, data: toJson(doc) });
  } catch (error) {
    console.error("Get legal page error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/legal-pages/admin/list: which pages have been saved, when and by whom
const listLegalPages = async (req, res) => {
  try {
    const docs = await LegalPage.find({}, { kind: 1, title: 1, lastUpdated: 1, updatedAt: 1, updatedBy: 1 }).lean();
    res.json({
      success: true,
      data: docs.map((d) => ({ kind: d.kind, title: d.title, lastUpdated: d.lastUpdated, updatedAt: d.updatedAt, updatedBy: { name: d.updatedBy?.name, email: d.updatedBy?.email } })),
    });
  } catch (error) {
    console.error("List legal pages error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/legal-pages/admin/:kind: the saved page with editor details (404 = not saved yet)
const getLegalPageAdmin = async (req, res) => {
  try {
    if (!checkKind(req, res)) return;
    const doc = await LegalPage.findOne({ kind: req.params.kind }).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not saved yet." });
    res.json({ success: true, data: toJson(doc, { includeEditor: true }) });
  } catch (error) {
    console.error("Get legal page (admin) error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/legal-pages/:kind: publish a new version.
// Body: the page content, plus optional changeNote and baseUpdatedAt (the updatedAt the editor started
// from; if someone else published in the meantime the save is refused instead of overwriting their work).
const saveLegalPage = async (req, res) => {
  try {
    if (!checkKind(req, res)) return;
    const { kind } = req.params;
    const content = sanitizeLegalPage(req.body);

    const existing = await LegalPage.findOne({ kind }, { updatedAt: 1, updatedBy: 1 }).lean();
    const base = req.body?.baseUpdatedAt;
    if (existing && base !== undefined && (!base || new Date(base).getTime() !== new Date(existing.updatedAt).getTime())) {
      return res.status(409).json({
        success: false,
        message: `${existing.updatedBy?.name || "Someone"} published a newer version of this page while you were editing. Reload it to see their changes before saving.`,
      });
    }

    const editor = { userId: req.user._id, name: req.user.name, email: req.user.email };
    const doc = await LegalPage.findOneAndUpdate(
      { kind },
      { $set: { ...content, kind, updatedBy: editor } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    await LegalPageRevision.create({ kind, content, changeNote: str(req.body?.changeNote, 300), savedBy: { ...editor, role: req.user.role } });
    const stale = await LegalPageRevision.find({ kind }, { _id: 1 }).sort({ createdAt: -1 }).skip(MAX_REVISIONS).lean();
    if (stale.length) await LegalPageRevision.deleteMany({ _id: { $in: stale.map((r) => r._id) } });

    res.json({ success: true, data: toJson(doc, { includeEditor: true }) });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ success: false, message: error.message });
    console.error("Save legal page error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/legal-pages/admin/:kind/revisions: version history (newest first, without the content)
const listRevisions = async (req, res) => {
  try {
    if (!checkKind(req, res)) return;
    const revisions = await LegalPageRevision.find({ kind: req.params.kind }, { content: 0 }).sort({ createdAt: -1 }).limit(MAX_REVISIONS).lean();
    res.json({
      success: true,
      data: revisions.map((r) => ({ _id: r._id, changeNote: r.changeNote, createdAt: r.createdAt, savedBy: { name: r.savedBy?.name, email: r.savedBy?.email, role: r.savedBy?.role } })),
    });
  } catch (error) {
    console.error("List legal page revisions error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/legal-pages/admin/revisions/:id: one earlier version, to load back into the editor
const getRevision = async (req, res) => {
  try {
    const revision = await LegalPageRevision.findById(req.params.id).lean();
    if (!revision) return res.status(404).json({ success: false, message: "Version not found." });
    res.json({ success: true, data: { _id: revision._id, kind: revision.kind, content: revision.content, changeNote: revision.changeNote, createdAt: revision.createdAt, savedBy: { name: revision.savedBy?.name } } });
  } catch (error) {
    if (error.name === "CastError") return res.status(404).json({ success: false, message: "Version not found." });
    console.error("Get legal page revision error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getLegalPage, listLegalPages, getLegalPageAdmin, saveLegalPage, listRevisions, getRevision, sanitizeLegalPage };
