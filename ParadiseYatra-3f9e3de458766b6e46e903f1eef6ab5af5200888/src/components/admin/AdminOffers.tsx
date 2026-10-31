"use client";

// Admin → Offers: the bar pinned to the top of every page, and the home page "Discounts & Offers" cards.

import { useEffect, useState } from "react";
import { BadgePercent, Eye, EyeOff, Megaphone, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import OfferBar from "@/components/OfferBar";
import { getImageUrl } from "@/lib/utils";
import { OFFER_BAR_THEMES, OFFER_TYPE_LABELS, type OfferBarTheme, type OfferCard, type OfferType } from "@/lib/offers";
import { AdminPageHeader, AdminSpinner, cardStyle, inputClass, labelClass } from "./hotels/shared";

async function offersFetch<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  const res = await fetch(`/api/offers-admin?p=${encodeURIComponent(path)}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || `Request failed (${res.status})`);
  return data as T;
}

const LINK_OK = (url: string) => !url || /^(\/(?!\/)|https?:\/\/)/i.test(url);
const LINK_HINT = 'A page on this site ("/package/bali-honeymoon") or a full "https://" link.';

// ISO <-> <input type="datetime-local"> in the browser's time zone (the team works in IST)
const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "";

/* ---------------- Top bar ---------------- */

interface BarForm {
  isActive: boolean;
  label: string;
  message: string;
  linkUrl: string;
  ctaText: string;
  theme: OfferBarTheme;
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
}

const BLANK_BAR: BarForm = {
  isActive: false,
  label: "FESTIVE SALE",
  message: "Save up to **40% off** on your trip",
  linkUrl: "",
  ctaText: "",
  theme: "sunset",
  startsAt: "",
  endsAt: "",
  showCountdown: true,
};

function BarEditor() {
  const [form, setForm] = useState<BarForm>(BLANK_BAR);
  const [meta, setMeta] = useState<{ updatedAt?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    offersFetch<{ data: (Partial<BarForm> & { startsAt?: string; endsAt?: string; updatedAt?: string; updatedBy?: { name?: string } }) | null }>("bar")
      .then(({ data }) => {
        if (!data) return;
        setForm({
          isActive: !!data.isActive,
          label: data.label || "",
          message: data.message || "",
          linkUrl: data.linkUrl || "",
          ctaText: data.ctaText || "",
          theme: (data.theme as OfferBarTheme) || "sunset",
          startsAt: toLocalInput(data.startsAt),
          endsAt: toLocalInput(data.endsAt),
          showCountdown: data.showCountdown !== false,
        });
        setMeta({ updatedAt: data.updatedAt, name: data.updatedBy?.name });
      })
      .catch((e) => toast.error((e as Error).message || "Failed to load the offer bar"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof BarForm>(key: K, value: BarForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const endsInPast = !!form.endsAt && new Date(form.endsAt).getTime() <= Date.now();
  const startsLater = !!form.startsAt && new Date(form.startsAt).getTime() > Date.now();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!LINK_OK(form.linkUrl.trim())) return toast.error(LINK_HINT);
    if (form.isActive && !form.label.trim() && !form.message.trim()) return toast.error("Add a label or a message before switching the bar on.");
    if (form.startsAt && form.endsAt && new Date(form.startsAt) >= new Date(form.endsAt)) return toast.error("The end time must be after the start time.");
    setSaving(true);
    try {
      const { data } = await offersFetch<{ data: { updatedAt?: string; updatedBy?: { name?: string } } }>("bar", {
        method: "PUT",
        body: JSON.stringify({ ...form, linkUrl: form.linkUrl.trim(), startsAt: fromLocalInput(form.startsAt), endsAt: fromLocalInput(form.endsAt) }),
      });
      setMeta({ updatedAt: data?.updatedAt, name: data?.updatedBy?.name });
      toast.success(form.isActive ? "Saved. The bar is live on the website." : "Saved. The bar is switched off.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminSpinner label="Loading offer bar..." />;

  const status = !form.isActive ? "Off" : endsInPast ? "Ended" : startsLater ? `Starts ${fmt(fromLocalInput(form.startsAt))}` : "Live";

  return (
    <form onSubmit={save} className="space-y-5">
      {/* Preview */}
      <div className="rounded-2xl border bg-white p-4" style={cardStyle}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-800">Preview</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              status === "Live" ? "bg-emerald-50 text-emerald-700" : status === "Off" || status === "Ended" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <OfferBar
            preview
            bar={{
              label: form.label,
              message: form.message,
              linkUrl: form.linkUrl,
              ctaText: form.ctaText,
              theme: form.theme,
              endsAt: fromLocalInput(form.endsAt),
              showCountdown: form.showCountdown,
              version: 0,
            }}
          />
          <div className="flex h-12 items-center gap-3 border-t border-slate-100 bg-white px-4 text-xs text-slate-400">
            <span className="h-6 w-6 rounded-md bg-slate-200" /> Website header
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">It stays pinned to the top while visitors scroll, on every page. Visitors can close it, and it shows again when they reload the page.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border bg-white p-5" style={cardStyle}>
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-800">
            <input type="checkbox" className="h-4 w-4" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Show the offer bar on the website
          </label>
          <div>
            <label className={labelClass}>Label</label>
            <input className={inputClass} value={form.label} maxLength={30} placeholder="FESTIVE SALE" onChange={(e) => set("label", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Message</label>
            <input className={inputClass} value={form.message} maxLength={140} placeholder="Save up to **40% off** on your trip" onChange={(e) => set("message", e.target.value)} />
            <p className="mt-1 text-xs text-slate-400">Put ** around the words to make bold, e.g. **40% off**.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Opens when clicked (optional)</label>
              <input className={inputClass} value={form.linkUrl} placeholder="/package/international" onChange={(e) => set("linkUrl", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Button text (optional)</label>
              <input className={inputClass} value={form.ctaText} maxLength={24} placeholder="Explore deals" onChange={(e) => set("ctaText", e.target.value)} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-400">{LINK_HINT} The button shows on larger screens when a link is set.</p>
        </div>

        <div className="space-y-4 rounded-2xl border bg-white p-5" style={cardStyle}>
          <div>
            <label className={labelClass}>Colour</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(OFFER_BAR_THEMES) as OfferBarTheme[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("theme", key)}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-semibold ${form.theme === key ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="h-6 w-10 shrink-0 rounded-md" style={{ background: OFFER_BAR_THEMES[key].background }} />
                  {OFFER_BAR_THEMES[key].name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Starts (optional)</label>
              <input type="datetime-local" className={inputClass} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Ends (optional)</label>
              <input type="datetime-local" className={inputClass} value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-slate-400">Times are in your computer&apos;s time zone. The bar appears and disappears on its own at these times.</p>
          {endsInPast && form.isActive && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">The end time has passed, so the bar won&apos;t show. Set a later end time.</p>}
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={form.showCountdown} disabled={!form.endsAt} onChange={(e) => set("showCountdown", e.target.checked)} />
            Show a countdown to the end time
          </label>
          {!form.endsAt && <p className="-mt-2 text-xs text-slate-400">Set an end time to show the countdown.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {meta?.updatedAt && (
          <span className="text-xs text-slate-400">
            Last saved {fmt(meta.updatedAt)}
            {meta.name ? ` by ${meta.name}` : ""}
          </span>
        )}
        <button type="submit" disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: "#6366f1" }}>
          {saving ? "Saving..." : "Save offer bar"}
        </button>
      </div>
    </form>
  );
}

/* ---------------- Home page offers ---------------- */

interface OfferForm {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  type: OfferType;
  discountText: string;
  validUntil: string; // yyyy-mm-dd
  order: string;
  isActive: boolean;
}

const blankOffer = (order: number): OfferForm => ({ title: "", subtitle: "", imageUrl: "", linkUrl: "", type: "package", discountText: "", validUntil: "", order: String(order), isActive: true });

const isExpired = (o: OfferCard) => !!o.validUntil && new Date(o.validUntil).getTime() <= Date.now();

function OffersEditor() {
  const [items, setItems] = useState<OfferCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfferCard | null>(null);
  const [form, setForm] = useState<OfferForm>(blankOffer(1));
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<OfferCard | null>(null);

  const load = async () => {
    try {
      const data = await offersFetch<{ offers: OfferCard[] }>("all");
      setItems(data.offers || []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = <K extends keyof OfferForm>(key: K, value: OfferForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(blankOffer(items.length + 1));
    setShowForm(true);
  };

  const openEdit = (o: OfferCard) => {
    setEditing(o);
    setForm({
      title: o.title,
      subtitle: o.subtitle || "",
      imageUrl: o.imageUrl,
      linkUrl: o.linkUrl || "",
      type: o.type || "package",
      discountText: o.discountText || "",
      validUntil: o.validUntil ? new Date(o.validUntil).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "",
      order: String(o.order),
      isActive: o.isActive,
    });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) return toast.error("Please upload an image.");
    if (!form.title.trim()) return toast.error("Please add a title.");
    if (!LINK_OK(form.linkUrl.trim())) return toast.error(LINK_HINT);
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl.trim(),
      type: form.type,
      discountText: form.discountText.trim(),
      // Valid through the whole of that day, India time
      validUntil: form.validUntil ? `${form.validUntil}T23:59:59+05:30` : null,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (editing) await offersFetch(editing._id, { method: "PUT", body: JSON.stringify(payload) });
      else await offersFetch("", { method: "POST", body: JSON.stringify(payload) });
      toast.success(editing ? "Offer updated" : "Offer added");
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (o: OfferCard) => {
    try {
      await offersFetch(o._id, { method: "PUT", body: JSON.stringify({ isActive: !o.isActive }) });
      setItems((p) => p.map((x) => (x._id === o._id ? { ...x, isActive: !o.isActive } : x)));
    } catch (err) {
      toast.error((err as Error).message || "Failed to update");
    }
  };

  const remove = async (o: OfferCard) => {
    try {
      await offersFetch(o._id, { method: "DELETE" });
      setItems((p) => p.filter((x) => x._id !== o._id));
      toast.success("Deleted");
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete");
    }
  };

  if (loading) return <AdminSpinner label="Loading offers..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Shown in &quot;Discounts &amp; Offers&quot; on the home page and &quot;Offers made for you&quot; on the hotels page (hotel deals first), in display order. Expired offers hide on their own.
        </p>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: "#6366f1" }}>
          <Plus className="h-4 w-4" /> Add offer
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border bg-white py-14 text-center text-sm text-slate-400" style={cardStyle}>
          No offers yet, so the offers sections on the home and hotels pages are hidden. Click &quot;Add offer&quot; to publish one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((o) => {
            const src = getImageUrl(o.imageUrl);
            const expired = isExpired(o);
            return (
              <div key={o._id} className={`overflow-hidden rounded-2xl border bg-white ${o.isActive && !expired ? "" : "opacity-60"}`} style={cardStyle}>
                <div className="relative aspect-[16/10] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src && <img src={src} alt={o.title} className="h-full w-full object-cover" />}
                  {o.discountText && <span className="absolute bottom-2 right-2 rounded-lg bg-white px-2 py-1 text-xs font-extrabold text-indigo-600 shadow">{o.discountText}</span>}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">{OFFER_TYPE_LABELS[o.type || "package"]}</span>
                    {!o.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">Hidden</span>}
                    {expired && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">Expired</span>}
                  </div>
                  <p className="mt-2 truncate font-bold text-slate-900">{o.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    Order {o.order}
                    {o.validUntil ? ` · until ${new Date(o.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}` : ""}
                    {o.linkUrl ? ` · ${o.linkUrl}` : ""}
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => toggle(o)} className="rounded-lg bg-slate-50 p-2 text-slate-600 hover:bg-slate-100" title={o.isActive ? "Hide" : "Show"}>
                      {o.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => openEdit(o)} className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setToDelete(o)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !saving && setShowForm(false)}>
          <form onSubmit={save} className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit offer" : "Add offer"}</h2>
              <button type="button" onClick={() => !saving && setShowForm(false)} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <ImageUpload value={form.imageUrl} onChange={(u) => set("imageUrl", u)} label="Offer image *" contentType="offers" />
                <p className="mt-1 text-xs text-slate-400">Landscape photo, about 1200 x 750 px, under 250KB.</p>
              </div>
              <div>
                <label className={labelClass}>Title *</label>
                <input className={inputClass} value={form.title} maxLength={120} placeholder="Bali honeymoon: 6 nights" onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Short description (optional)</label>
                <input className={inputClass} value={form.subtitle} maxLength={200} placeholder="Flights, villa stay and private transfers included" onChange={(e) => set("subtitle", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Discount tag (optional)</label>
                  <input className={inputClass} value={form.discountText} maxLength={40} placeholder="Up to 40% off" onChange={(e) => set("discountText", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value as OfferType)}>
                    {(Object.keys(OFFER_TYPE_LABELS) as OfferType[]).map((t) => (
                      <option key={t} value={t}>{OFFER_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Opens when clicked (optional)</label>
                <input className={inputClass} value={form.linkUrl} placeholder="/package/bali-honeymoon" onChange={(e) => set("linkUrl", e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className={labelClass}>Valid until (optional)</label>
                  <input type="date" className={inputClass} value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Display order</label>
                  <input type="number" className={inputClass} value={form.order} onChange={(e) => set("order", e.target.value)} />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" className="h-4 w-4" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  Show on website
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
              <button type="button" onClick={() => !saving && setShowForm(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: "#6366f1" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete offer?"
        message="This offer will be removed from the website permanently. To hide it for now, use the eye button."
        confirmText="Delete"
      />
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function AdminOffers() {
  const [tab, setTab] = useState<"bar" | "offers">("bar");
  return (
    <div className="space-y-5">
      <AdminPageHeader icon={BadgePercent} title="Offers" subtitle="The offer bar at the top of every page, and the offer cards on the home and hotels pages" />
      <div className="flex w-fit rounded-xl bg-slate-100 p-1">
        {[
          { id: "bar" as const, label: "Top offer bar", Icon: Megaphone },
          { id: "offers" as const, label: "Home page offers", Icon: BadgePercent },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      {tab === "bar" ? <BarEditor /> : <OffersEditor />}
    </div>
  );
}
