"use client";

// Admin → Legal Pages: the legal team edits the Privacy, Terms, Cookie and Refund pages here.
// Content is a list of sections made of blocks (see src/lib/legal/types.ts); "Preview" renders it with
// the real page layout. Publishing stores a new version (with history) and refreshes the live page.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  History,
  Loader2,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import LegalPage, { LEGAL_PAGES } from "@/components/legal/LegalPage";
import { LEGAL_DEFAULTS } from "@/lib/legal/defaults";
import { LEGAL_ICON_NAMES, legalIcon } from "@/lib/legal/icons";
import {
  formatLegalDate,
  LEGAL_KINDS,
  legalSlug,
  type LegalBlock,
  type LegalBlockType,
  type LegalKind,
  type LegalPageData,
  type LegalSectionData,
} from "@/lib/legal/types";

type Content = Pick<LegalPageData, "title" | "description" | "lastUpdated" | "glance" | "sections">;

interface SavedMeta {
  saved: boolean;
  updatedAt?: string;
  updatedBy?: { name?: string; email?: string };
}

interface Revision {
  _id: string;
  changeNote?: string;
  createdAt: string;
  savedBy?: { name?: string; email?: string; role?: string };
}

const BLOCK_TYPES: { type: LegalBlockType; label: string; hint: string }[] = [
  { type: "paragraph", label: "Paragraph", hint: "A paragraph of text" },
  { type: "heading", label: "Sub-heading", hint: "A small heading inside the section" },
  { type: "list", label: "Bullet list", hint: "Points with check marks" },
  { type: "note", label: "Highlighted note", hint: "Coloured box for key statements" },
  { type: "cards", label: "Cards", hint: "2 or 3 boxes side by side, each with an icon" },
  { type: "chips", label: "Tags", hint: "Small labelled pills" },
  { type: "fees", label: "Cancellation fee dials", hint: "Percentage dials with a description" },
  { type: "steps", label: "Timeline steps", hint: "Steps joined by a line" },
  { type: "choices", label: "Options (A OR B)", hint: "Alternatives separated by OR" },
  { type: "contact", label: "Contact card", hint: "Name with address, phone and email lines" },
];

const blockLabel = (type: LegalBlockType) => BLOCK_TYPES.find((b) => b.type === type)?.label || type;

const newBlock = (type: LegalBlockType): LegalBlock => {
  switch (type) {
    case "paragraph":
    case "heading":
      return { type, text: "" };
    case "list":
      return { type, items: [""] };
    case "note":
      return { type, tone: "info", icon: "Info", text: "" };
    case "cards":
      return { type, columns: 2, items: [{ icon: "FileText", title: "", text: "" }] };
    case "chips":
      return { type, items: [{ icon: "CircleCheck", label: "" }] };
    case "fees":
      return { type, items: [{ label: "", percent: 25, text: "" }] };
    case "steps":
    case "choices":
      return { type, items: [{ icon: "CircleCheck", text: "" }] };
    case "contact":
      return { type, title: "", subtitle: "", lines: [{ icon: "Mail", text: "" }] };
  }
};

const toContent = (page: LegalPageData): Content => ({
  title: page.title,
  description: page.description,
  lastUpdated: page.lastUpdated,
  glance: page.glance,
  sections: page.sections,
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "";

const authHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

// Problems the backend would also refuse, shown before publishing
const findProblems = (content: Content): string[] => {
  const problems: string[] = [];
  if (!content.title.trim()) problems.push("The page title is empty.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(content.lastUpdated)) problems.push("Set the 'Last updated' date.");
  if (!content.sections.length) problems.push("Add at least one section.");
  content.sections.forEach((s, i) => {
    if (!s.title.trim()) problems.push(`Section ${i + 1} has no title.`);
    if (!s.blocks.length) problems.push(`Section "${s.title || i + 1}" has no content.`);
  });
  return problems;
};

/* ---------- Small form controls ---------- */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea className={`${inputClass} leading-relaxed`} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}

function IconButton({ title, onClick, disabled, danger, children }: { title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 ${
        danger ? "hover:text-red-600" : "hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Current = legalIcon(value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        title={`Icon: ${value || "default"}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 hover:border-blue-400"
      >
        <Current className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-30 grid w-[296px] grid-cols-8 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {LEGAL_ICON_NAMES.map((name) => {
            const Icon = legalIcon(name);
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${name === value ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Editable list of items with move / remove / add */
function ItemList<T>({ items, onChange, make, addLabel, render }: { items: T[]; onChange: (items: T[]) => void; make: () => T; addLabel: string; render: (item: T, set: (item: T) => void) => ReactNode }) {
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2">
          <div className="min-w-0 flex-1">{render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}</div>
          <div className="flex shrink-0">
            <IconButton title="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
            <IconButton title="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
            <IconButton title="Remove" danger onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></IconButton>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, make()])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

const IconTextRow = ({ icon, text, onIcon, onText, rows = 2, placeholder }: { icon: string; text: string; onIcon: (v: string) => void; onText: (v: string) => void; rows?: number; placeholder?: string }) => (
  <div className="flex gap-2">
    <IconPicker value={icon} onChange={onIcon} />
    <TextArea value={text} onChange={onText} rows={rows} placeholder={placeholder} />
  </div>
);

/* ---------- Block editor ---------- */

function BlockEditor({ block, onChange }: { block: LegalBlock; onChange: (b: LegalBlock) => void }) {
  switch (block.type) {
    case "paragraph":
      return <TextArea rows={4} value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder="Paragraph text" />;
    case "heading":
      return <input className={inputClass} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Sub-heading" />;
    case "list":
      return (
        <ItemList
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          make={() => ""}
          addLabel="Add point"
          render={(item, set) => <TextArea rows={2} value={item} onChange={set} placeholder="Point" />}
        />
      );
    case "note":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <IconPicker value={block.icon} onChange={(icon) => onChange({ ...block, icon })} />
            <select className={`${inputClass} w-auto`} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}>
              <option value="info">Blue (information)</option>
              <option value="warning">Amber (caution)</option>
              <option value="success">Green (reassurance)</option>
            </select>
          </div>
          <TextArea rows={3} value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder="Note text" />
        </div>
      );
    case "cards":
      return (
        <div className="space-y-2">
          <select className={`${inputClass} w-auto`} value={block.columns} onChange={(e) => onChange({ ...block, columns: Number(e.target.value) === 3 ? 3 : 2 })}>
            <option value={2}>2 per row</option>
            <option value={3}>3 per row</option>
          </select>
          <ItemList
            items={block.items}
            onChange={(items) => onChange({ ...block, items })}
            make={() => ({ icon: "FileText", title: "", text: "" })}
            addLabel="Add card"
            render={(card, set) => (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <IconPicker value={card.icon} onChange={(icon) => set({ ...card, icon })} />
                  <input className={inputClass} value={card.title} onChange={(e) => set({ ...card, title: e.target.value })} placeholder="Card title (optional)" />
                </div>
                <TextArea rows={3} value={card.text} onChange={(text) => set({ ...card, text })} placeholder="Card text" />
              </div>
            )}
          />
        </div>
      );
    case "chips":
      return (
        <ItemList
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          make={() => ({ icon: "CircleCheck", label: "" })}
          addLabel="Add tag"
          render={(chip, set) => (
            <div className="flex gap-2">
              <IconPicker value={chip.icon} onChange={(icon) => set({ ...chip, icon })} />
              <input className={inputClass} value={chip.label} onChange={(e) => set({ ...chip, label: e.target.value })} placeholder="Tag label" />
            </div>
          )}
        />
      );
    case "fees":
      return (
        <ItemList
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          make={() => ({ label: "", percent: 25, text: "" })}
          addLabel="Add fee"
          render={(fee, set) => (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className={inputClass} value={fee.label} onChange={(e) => set({ ...fee, label: e.target.value })} placeholder="When, e.g. 30 days or more before departure" />
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={`${inputClass} pr-7`}
                    value={fee.percent}
                    onChange={(e) => set({ ...fee, percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                  />
                  <span className="pointer-events-none absolute right-3 top-2 text-sm text-slate-400">%</span>
                </div>
              </div>
              <TextArea rows={2} value={fee.text} onChange={(text) => set({ ...fee, text })} placeholder="What is charged" />
            </div>
          )}
        />
      );
    case "steps":
    case "choices":
      return (
        <ItemList
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          make={() => ({ icon: "CircleCheck", text: "" })}
          addLabel={block.type === "steps" ? "Add step" : "Add option"}
          render={(item, set) => <IconTextRow icon={item.icon} text={item.text} onIcon={(icon) => set({ ...item, icon })} onText={(text) => set({ ...item, text })} />}
        />
      );
    case "contact":
      return (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputClass} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Name or role, e.g. Grievance Officer" />
            <input className={inputClass} value={block.subtitle} onChange={(e) => onChange({ ...block, subtitle: e.target.value })} placeholder="Below the name (optional)" />
          </div>
          <ItemList
            items={block.lines}
            onChange={(lines) => onChange({ ...block, lines })}
            make={() => ({ icon: "Mail", text: "" })}
            addLabel="Add line"
            render={(line, set) => <IconTextRow rows={1} icon={line.icon} text={line.text} onIcon={(icon) => set({ ...line, icon })} onText={(text) => set({ ...line, text })} />}
          />
        </div>
      );
  }
}

function AddBlockMenu({ onAdd }: { onAdd: (type: LegalBlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="h-3.5 w-3.5" /> Add content <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-30 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => {
                onAdd(b.type);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50"
            >
              <span className="block text-sm font-semibold text-slate-800">{b.label}</span>
              <span className="block text-xs text-slate-500">{b.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  index,
  total,
  open,
  onToggle,
  onChange,
  onMove,
  onDelete,
}: {
  section: LegalSectionData;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  onChange: (s: LegalSectionData) => void;
  onMove: (d: number) => void;
  onDelete: () => void;
}) {
  const Icon = legalIcon(section.icon);
  const setBlock = (i: number, b: LegalBlock) => onChange({ ...section, blocks: section.blocks.map((x, j) => (j === i ? b : x)) });
  const moveBlock = (i: number, d: number) => {
    const blocks = [...section.blocks];
    [blocks[i], blocks[i + d]] = [blocks[i + d], blocks[i]];
    onChange({ ...section, blocks });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-600">Section {String(index + 1).padStart(2, "0")}</span>
            <span className="block truncate text-sm font-bold text-slate-800">{section.title || "Untitled section"}</span>
          </span>
          <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="flex shrink-0 items-center">
          <IconButton title="Move section up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></IconButton>
          <IconButton title="Move section down" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></IconButton>
          <IconButton title="Delete section" danger onClick={onDelete}><Trash2 className="h-4 w-4" /></IconButton>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-4">
          <div className="flex gap-2">
            <IconPicker value={section.icon} onChange={(icon) => onChange({ ...section, icon })} />
            <input className={`${inputClass} font-semibold`} value={section.title} onChange={(e) => onChange({ ...section, title: e.target.value })} placeholder="Section title" />
          </div>

          {section.blocks.map((block, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">{blockLabel(block.type)}</span>
                <div className="flex items-center">
                  <IconButton title="Move up" disabled={i === 0} onClick={() => moveBlock(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
                  <IconButton title="Move down" disabled={i === section.blocks.length - 1} onClick={() => moveBlock(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
                  <IconButton title="Remove" danger onClick={() => onChange({ ...section, blocks: section.blocks.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></IconButton>
                </div>
              </div>
              <BlockEditor block={block} onChange={(b) => setBlock(i, b)} />
            </div>
          ))}

          <AddBlockMenu onAdd={(type) => onChange({ ...section, blocks: [...section.blocks, newBlock(type)] })} />
        </div>
      )}
    </div>
  );
}

/* ---------- Main ---------- */

export default function AdminLegalPages() {
  const [kind, setKind] = useState<LegalKind>("privacy");
  const [content, setContent] = useState<Content>(() => toContent(LEGAL_DEFAULTS.privacy));
  const [baseline, setBaseline] = useState<string>(() => JSON.stringify(toContent(LEGAL_DEFAULTS.privacy)));
  const [meta, setMeta] = useState<SavedMeta>({ saved: false });
  const [statuses, setStatuses] = useState<Partial<Record<LegalKind, { updatedAt?: string; name?: string }>>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [message, setMessage] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null);
  // Set when the saved version could not be fetched: publishing is blocked so it can't be overwritten blindly
  const [loadError, setLoadError] = useState(false);

  const dirty = JSON.stringify(content) !== baseline;
  const problems = useMemo(() => findProblems(content), [content]);

  const loadStatuses = useCallback(async () => {
    try {
      const res = await fetch("/api/legal-pages?view=list", { headers: authHeaders(), cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        const next: Partial<Record<LegalKind, { updatedAt?: string; name?: string }>> = {};
        for (const row of data.data) next[row.kind as LegalKind] = { updatedAt: row.updatedAt, name: row.updatedBy?.name };
        setStatuses(next);
      }
    } catch {
      // The tabs just don't show "published" details
    }
  }, []);

  const loadPage = useCallback(async (target: LegalKind) => {
    setLoading(true);
    setLoadError(false);
    setMessage(null);
    setLoadedFrom(null);
    setRevisions(null);
    setHistoryOpen(false);
    setOpenSection(0);
    try {
      const res = await fetch(`/api/legal-pages?view=page&kind=${target}`, { headers: authHeaders(), cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        const fresh = toContent(LEGAL_DEFAULTS[target]);
        setContent(fresh);
        setBaseline(JSON.stringify(fresh));
        setMeta({ saved: false });
      } else if (res.ok && data.data) {
        const saved = toContent({ ...LEGAL_DEFAULTS[target], ...data.data });
        setContent(saved);
        setBaseline(JSON.stringify(saved));
        setMeta({ saved: true, updatedAt: data.data.updatedAt, updatedBy: data.data.updatedBy });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const fallback = toContent(LEGAL_DEFAULTS[target]);
      setContent(fallback);
      setBaseline(JSON.stringify(fallback));
      setMeta({ saved: false });
      setLoadError(true);
      setMessage({
        tone: "error",
        text: `${error instanceof Error && error.message ? error.message : "Could not load this page."} Publishing is disabled until the page loads, so the live version isn't overwritten. Reload to try again.`,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  useEffect(() => {
    loadPage(kind);
  }, [kind, loadPage]);

  // Warn before leaving the admin with unpublished edits
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const switchPage = (target: LegalKind) => {
    if (target === kind) return;
    if (dirty && !window.confirm("You have unpublished changes on this page. Leave them and switch pages?")) return;
    setKind(target);
  };

  const updateSection = (i: number, section: LegalSectionData) => setContent((c) => ({ ...c, sections: c.sections.map((s, j) => (j === i ? section : s)) }));

  const moveSection = (i: number, d: number) =>
    setContent((c) => {
      const sections = [...c.sections];
      [sections[i], sections[i + d]] = [sections[i + d], sections[i]];
      return { ...c, sections };
    });

  const deleteSection = (i: number) => {
    const title = content.sections[i]?.title || `Section ${i + 1}`;
    if (!window.confirm(`Delete the section "${title}"? You can still discard this before publishing.`)) return;
    setContent((c) => ({ ...c, sections: c.sections.filter((_, j) => j !== i) }));
    setOpenSection(null);
  };

  const addSection = () => {
    setContent((c) => ({ ...c, sections: [...c.sections, { id: "", title: "", icon: "FileText", blocks: [{ type: "paragraph", text: "" }] }] }));
    setOpenSection(content.sections.length);
  };

  const discard = () => {
    if (!window.confirm("Discard all unpublished changes on this page?")) return;
    setContent(JSON.parse(baseline));
    setLoadedFrom(null);
  };

  const restoreDefaults = () => {
    if (!window.confirm("Replace the editor content with the original built-in wording? Nothing changes on the website until you publish.")) return;
    setContent(clone(toContent(LEGAL_DEFAULTS[kind])));
    setLoadedFrom("the original built-in wording");
  };

  const openHistory = async () => {
    setHistoryOpen((o) => !o);
    if (revisions) return;
    try {
      const res = await fetch(`/api/legal-pages?view=revisions&kind=${kind}`, { headers: authHeaders(), cache: "no-store" });
      const data = await res.json();
      setRevisions(res.ok && Array.isArray(data.data) ? data.data : []);
    } catch {
      setRevisions([]);
    }
  };

  const loadRevision = async (revision: Revision) => {
    if (dirty && !window.confirm("Load this version into the editor? Your unpublished changes will be replaced.")) return;
    try {
      const res = await fetch(`/api/legal-pages?view=revision&id=${revision._id}`, { headers: authHeaders(), cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.data?.content) throw new Error(data.message);
      setContent(toContent({ ...LEGAL_DEFAULTS[kind], ...data.data.content }));
      setLoadedFrom(`the version published ${formatDateTime(revision.createdAt)}${revision.savedBy?.name ? ` by ${revision.savedBy.name}` : ""}`);
      setHistoryOpen(false);
      setMode("edit");
    } catch {
      setMessage({ tone: "error", text: "Could not load that version." });
    }
  };

  const publish = async () => {
    if (problems.length) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/legal-pages?kind=${kind}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ ...content, changeNote, baseUpdatedAt: meta.saved ? meta.updatedAt : null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.data) {
        setMessage({ tone: "error", text: data.message || "Publishing failed. Please try again." });
        return;
      }
      const saved = toContent({ ...LEGAL_DEFAULTS[kind], ...data.data });
      setContent(saved);
      setBaseline(JSON.stringify(saved));
      setMeta({ saved: true, updatedAt: data.data.updatedAt, updatedBy: data.data.updatedBy });
      setPublishOpen(false);
      setChangeNote("");
      setLoadedFrom(null);
      setRevisions(null);
      setMessage({ tone: "success", text: "Published. The live page now shows this version." });
      loadStatuses();
    } catch {
      setMessage({ tone: "error", text: "Publishing failed. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  };

  const preview: LegalPageData = {
    kind,
    ...content,
    sections: content.sections.map((s, i) => ({ ...s, id: s.id || legalSlug(s.title) || `section-${i + 1}`, title: s.title || "Untitled section" })),
  };
  const page = LEGAL_PAGES[kind];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Legal Pages</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Edit the Privacy, Terms, Cookie and Refund pages. Changes go live when you press <strong>Publish</strong>; every published version is kept in History.
          </p>
        </div>
        <a href={page.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600">
          View live page <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Page tabs */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {LEGAL_KINDS.map((k) => {
          const info = LEGAL_PAGES[k];
          const status = statuses[k];
          const active = k === kind;
          return (
            <button
              key={k}
              type="button"
              onClick={() => switchPage(k)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/15" : "border-slate-200 bg-white hover:border-blue-300"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                <info.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-800">{info.title}</span>
                <span className="block truncate text-xs text-slate-500">
                  {status?.updatedAt ? `Published ${formatDateTime(status.updatedAt)}${status.name ? ` · ${status.name}` : ""}` : "Showing built-in wording"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {m === "edit" ? <PencilLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {m === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
        <button type="button" onClick={openHistory} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <History className="h-4 w-4" /> History
        </button>
        <button type="button" onClick={restoreDefaults} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          <RotateCcw className="h-4 w-4" /> Original wording
        </button>
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="hidden text-xs font-semibold text-amber-600 sm:inline">Unpublished changes</span>}
          {dirty && (
            <button type="button" onClick={discard} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Discard
            </button>
          )}
          <button
            type="button"
            disabled={!dirty || loading || loadError}
            onClick={() => setPublishOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {message.tone === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setMessage(null)}><X className="h-4 w-4" /></button>
        </div>
      )}
      {loadedFrom && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          The editor now holds {loadedFrom}. Review it, then press <strong>Publish</strong> to put it live, or <strong>Discard</strong> to go back.
        </div>
      )}
      {!meta.saved && !loading && !loadError && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This page hasn&apos;t been published from the admin panel yet, so the website shows its built-in wording (loaded below). Your first Publish replaces it.
        </div>
      )}
      {meta.saved && meta.updatedAt && (
        <p className="text-xs text-slate-500">
          Live version published {formatDateTime(meta.updatedAt)}
          {meta.updatedBy?.name ? ` by ${meta.updatedBy.name}` : ""}.
        </p>
      )}

      {/* History */}
      {historyOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Published versions</h2>
            <button type="button" aria-label="Close history" onClick={() => setHistoryOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
          </div>
          {!revisions ? (
            <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
          ) : revisions.length === 0 ? (
            <p className="text-sm text-slate-500">No versions yet. Each time this page is published, a copy is kept here.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {revisions.map((r, i) => (
                <li key={r._id} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDateTime(r.createdAt)} {i === 0 && <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">Live</span>}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.savedBy?.name || "Unknown"}
                      {r.changeNote ? ` · ${r.changeNote}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => loadRevision(r)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600">
                    Load into editor
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading {page.title}…
        </div>
      ) : mode === "preview" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">Preview: this is how the page will look once published</div>
          <LegalPage data={preview} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Page details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Page details</h2>
            <div className="grid gap-3 md:grid-cols-[1fr_200px]">
              <Field label="Title">
                <input className={inputClass} value={content.title} onChange={(e) => setContent((c) => ({ ...c, title: e.target.value }))} />
              </Field>
              <Field label="Last updated" hint={content.lastUpdated ? `Shows as "${formatLegalDate(content.lastUpdated)}"` : undefined}>
                <div className="flex gap-1.5">
                  <input type="date" className={inputClass} value={content.lastUpdated} onChange={(e) => setContent((c) => ({ ...c, lastUpdated: e.target.value }))} />
                  <button type="button" title="Set to today" onClick={() => setContent((c) => ({ ...c, lastUpdated: today() }))} className="shrink-0 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Today
                  </button>
                </div>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Introduction (under the title)">
                <TextArea rows={2} value={content.description} onChange={(description) => setContent((c) => ({ ...c, description }))} />
              </Field>
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Text formatting in any box: <code className="font-semibold text-slate-700">**bold**</code>, <code className="font-semibold text-slate-700">*italic*</code>, and links as{" "}
              <code className="font-semibold text-slate-700">[link text](/contact)</code>, <code className="font-semibold text-slate-700">[email us](mailto:info@paradiseyatra.com)</code> or{" "}
              <code className="font-semibold text-slate-700">[call](tel:+918979396413)</code>.
            </p>
          </div>

          {/* At a glance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-bold text-slate-800">At a glance</h2>
            <p className="mb-3 text-xs text-slate-500">The summary cards under the page header (up to 4 look best). Keep them consistent with the full text below.</p>
            <ItemList
              items={content.glance}
              onChange={(glance) => setContent((c) => ({ ...c, glance }))}
              make={() => ({ icon: "CircleCheck", title: "", text: "" })}
              addLabel="Add summary card"
              render={(g, set) => (
                <div className="flex gap-2">
                  <IconPicker value={g.icon} onChange={(icon) => set({ ...g, icon })} />
                  <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[220px_1fr]">
                    <input className={inputClass} value={g.title} onChange={(e) => set({ ...g, title: e.target.value })} placeholder="Short title" />
                    <input className={inputClass} value={g.text} onChange={(e) => set({ ...g, text: e.target.value })} placeholder="One line" />
                  </div>
                </div>
              )}
            />
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-sm font-bold text-slate-800">Sections ({content.sections.length})</h2>
              <button type="button" onClick={() => setOpenSection(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                Collapse all
              </button>
            </div>
            {content.sections.map((section, i) => (
              <SectionEditor
                key={i}
                section={section}
                index={i}
                total={content.sections.length}
                open={openSection === i}
                onToggle={() => setOpenSection(openSection === i ? null : i)}
                onChange={(s) => updateSection(i, s)}
                onMove={(d) => {
                  moveSection(i, d);
                  if (openSection === i) setOpenSection(i + d);
                }}
                onDelete={() => deleteSection(i)}
              />
            ))}
            <button
              type="button"
              onClick={addSection}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600"
            >
              <Plus className="h-4 w-4" /> Add section
            </button>
          </div>
        </div>
      )}

      {/* Publish dialog */}
      {publishOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="publish-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h2 id="publish-title" className="text-lg font-bold text-slate-900">Publish {page.title}?</h2>
            {problems.length ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <p className="font-semibold">Fix these first:</p>
                <ul className="mt-1 list-disc pl-5">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-500">
                  The live page will show this version straight away. Its &quot;Last updated&quot; date reads <strong>{formatLegalDate(content.lastUpdated)}</strong>
                  {content.lastUpdated !== today() ? " (not today: change it in Page details if this is a new revision)" : ""}.
                </p>
                <div className="mt-4">
                  <Field label="What changed? (optional, kept in History)">
                    <input className={inputClass} value={changeNote} maxLength={300} onChange={(e) => setChangeNote(e.target.value)} placeholder="e.g. Updated cancellation charges" />
                  </Field>
                </div>
              </>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPublishOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || problems.length > 0}
                onClick={publish}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Publish now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
