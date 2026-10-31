"use client";

// Admin → Customer Gallery: customer photos and videos shown on the home page ("Traveller moments"),
// on /traveller-stories, and on destination & package pages of the same state/country.

import { useEffect, useMemo, useState } from "react";
import { Camera, Download, Eye, EyeOff, Home, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import MomentTile from "@/components/moments/MomentTile";
import MomentViewer from "@/components/moments/MomentViewer";
import { fetchTourLocations, type TourLocations } from "@/hooks/useTourLocations";
import { BUILT_IN_MOMENTS, parseVideo, TRAVELLER_STORIES_PATH, type CustomerMoment } from "@/lib/customerMoments";
import { AdminPageHeader, AdminSpinner, cardStyle, inputClass, labelClass } from "./hotels/shared";

async function galleryFetch<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";
  const res = await fetch(`/api/customer-moments-admin?p=${encodeURIComponent(path)}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) throw new Error(data?.message || `Request failed (${res.status})`);
  return data as T;
}

interface Form {
  type: "photo" | "video";
  imageUrl: string;
  videoUrl: string;
  customerName: string;
  location: string;
  otherLocation: string;
  tripDate: string;
  quote: string;
  showOnHome: boolean;
  consent: boolean;
  order: string;
  isActive: boolean;
}

const OTHER = "__other__";

const blank = (order: number): Form => ({
  type: "photo",
  imageUrl: "",
  videoUrl: "",
  customerName: "",
  location: "",
  otherLocation: "",
  tripDate: "",
  quote: "",
  showOnHome: false,
  consent: false,
  order: String(order),
  isActive: true,
});

// The original home page videos are tagged with a city or state; destination pages match on state/country names
const BUILT_IN_LOCATIONS: Record<string, string> = { Shimla: "Himachal Pradesh" };

type Filter = "all" | "photo" | "video" | "home";

export default function AdminCustomerMoments() {
  const [items, setItems] = useState<CustomerMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [locations, setLocations] = useState<TourLocations>({ indiaStates: [], internationalCountries: [] });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CustomerMoment | null>(null);
  const [form, setForm] = useState<Form>(blank(1));
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [toDelete, setToDelete] = useState<CustomerMoment | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  const load = async () => {
    try {
      const data = await galleryFetch<{ moments: CustomerMoment[] }>("all");
      setItems(data.moments || []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load the gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchTourLocations().then(setLocations).catch(() => {});
  }, []);

  const knownLocations = useMemo(() => new Set([...locations.indiaStates, ...locations.internationalCountries]), [locations]);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(blank(items.length + 1));
    setShowForm(true);
  };

  const openEdit = (m: CustomerMoment) => {
    const loc = m.location || "";
    const known = !loc || knownLocations.has(loc);
    setEditing(m);
    setForm({
      type: m.type,
      imageUrl: m.imageUrl || "",
      videoUrl: m.videoUrl || "",
      customerName: m.customerName,
      location: known ? loc : OTHER,
      otherLocation: known ? "" : loc,
      tripDate: m.tripDate || "",
      quote: m.quote || "",
      showOnHome: !!m.showOnHome,
      consent: !!m.consent,
      order: String(m.order ?? 0),
      isActive: m.isActive !== false,
    });
    setShowForm(true);
  };

  const video = form.type === "video" ? parseVideo(form.videoUrl.trim()) : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === "photo" && !form.imageUrl) return toast.error("Upload the photo.");
    if (form.type === "video") {
      if (!form.videoUrl.trim()) return toast.error("Add the video link.");
      if (!video) return toast.error("Use a YouTube or Instagram link, or a direct .mp4 video link.");
      if (video.kind === "instagram" && !form.imageUrl) return toast.error("Instagram videos need a cover image.");
    }
    if (!form.customerName.trim()) return toast.error("Add the customer's name.");
    if (!form.consent) return toast.error("Confirm that the customer agreed to share this.");

    const payload = {
      type: form.type,
      imageUrl: form.imageUrl,
      videoUrl: form.type === "video" ? form.videoUrl.trim() : "",
      customerName: form.customerName.trim(),
      location: (form.location === OTHER ? form.otherLocation : form.location).trim(),
      tripDate: form.tripDate.trim(),
      quote: form.quote.trim(),
      showOnHome: form.showOnHome,
      consent: form.consent,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (editing) await galleryFetch(editing._id, { method: "PUT", body: JSON.stringify(payload) });
      else await galleryFetch("", { method: "POST", body: JSON.stringify(payload) });
      toast.success(editing ? "Updated" : "Added to the gallery");
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (m: CustomerMoment, change: Partial<CustomerMoment>, done: string) => {
    try {
      await galleryFetch(m._id, { method: "PUT", body: JSON.stringify(change) });
      setItems((p) => p.map((x) => (x._id === m._id ? { ...x, ...change } : x)));
      toast.success(done);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update");
    }
  };

  const remove = async (m: CustomerMoment) => {
    try {
      await galleryFetch(m._id, { method: "DELETE" });
      setItems((p) => p.filter((x) => x._id !== m._id));
      toast.success("Deleted");
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete");
    }
  };

  // The 5 videos that were on the home page before this gallery existed
  const importBuiltIn = async () => {
    if (!window.confirm("Add the 5 traveller videos from the old home page section to the gallery? They will show on the home page.")) return;
    setImporting(true);
    try {
      for (const [i, m] of BUILT_IN_MOMENTS.entries()) {
        await galleryFetch("", {
          method: "POST",
          body: JSON.stringify({
            type: "video",
            videoUrl: m.videoUrl,
            customerName: m.customerName,
            location: BUILT_IN_LOCATIONS[m.location || ""] || m.location,
            quote: m.quote,
            showOnHome: true,
            consent: true, // already published on the home page by the company
            order: i + 1,
            isActive: true,
          }),
        });
      }
      toast.success("Added the 5 videos.");
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Import failed");
      await load();
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <AdminSpinner label="Loading gallery..." />;

  const shown = items.filter((m) => (filter === "all" ? true : filter === "home" ? m.showOnHome : m.type === filter));
  const homeCount = items.filter((m) => m.showOnHome && m.isActive !== false).length;
  const hasBuiltIn = items.some((m) => BUILT_IN_MOMENTS.some((b) => b.videoUrl === m.videoUrl));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={Camera}
        title="Customer Gallery"
        subtitle="Customer photos and videos for the home page, the Traveller Stories page, and destination & package pages"
        right={
          <div className="flex flex-wrap gap-2">
            {!hasBuiltIn && (
              <button onClick={importBuiltIn} disabled={importing} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-60">
                <Download className="h-4 w-4" /> {importing ? "Adding..." : "Add the 5 home page videos"}
              </button>
            )}
            <button onClick={openCreate} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: "#6366f1" }}>
              <Plus className="h-4 w-4" /> Add photo or video
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {(
            [
              ["all", "All", items.length],
              ["photo", "Photos", items.filter((m) => m.type === "photo").length],
              ["video", "Videos", items.filter((m) => m.type === "video").length],
              ["home", "On home page", items.filter((m) => m.showOnHome).length],
            ] as [Filter, string, number][]
          ).map(([id, label, n]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-lg px-3.5 py-1.5 text-sm font-bold ${filter === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              {label} <span className="text-xs font-semibold text-slate-400">{n}</span>
            </button>
          ))}
        </div>
        <a href={TRAVELLER_STORIES_PATH} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline">
          View Traveller Stories page ↗
        </a>
      </div>

      <p className="text-xs text-slate-500">
        The home page shows the first 5 items marked &quot;On home page&quot; ({homeCount} marked). Destination and package pages show items whose destination matches
        {items.length === 0 ? ". Until you add any, the home page keeps the original 5 traveller videos." : "."}
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl border bg-white py-14 text-center text-sm text-slate-400" style={cardStyle}>
          Nothing here yet. Click &quot;Add photo or video&quot; to add the first one.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((m, i) => (
            <div key={m._id} className={`overflow-hidden rounded-2xl border bg-white ${m.isActive === false ? "opacity-60" : ""}`} style={cardStyle}>
              <MomentTile moment={m} onOpen={() => setPreview(i)} className="aspect-[4/5] w-full rounded-none" sizes="25vw" />
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap gap-1">
                  {m.showOnHome && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">Home page</span>}
                  {m.isActive === false && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">Hidden</span>}
                  {!m.location && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600">No destination</span>}
                </div>
                <p className="truncate text-xs text-slate-400">Order {m.order ?? 0}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => patch(m, { showOnHome: !m.showOnHome }, m.showOnHome ? "Removed from home page" : "Added to home page")}
                    className={`rounded-lg p-2 ${m.showOnHome ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                    title={m.showOnHome ? "Remove from home page" : "Show on home page"}
                  >
                    <Home className="h-4 w-4" />
                  </button>
                  <button onClick={() => patch(m, { isActive: m.isActive === false }, m.isActive === false ? "Shown on website" : "Hidden")} className="rounded-lg bg-slate-50 p-2 text-slate-600 hover:bg-slate-100" title={m.isActive === false ? "Show" : "Hide"}>
                    {m.isActive === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(m)} className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setToDelete(m)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !saving && setShowForm(false)}>
          <form onSubmit={save} className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">{editing ? "Edit" : "Add photo or video"}</h2>
              <button type="button" onClick={() => !saving && setShowForm(false)} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {(["photo", "video"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold ${form.type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    {t === "photo" ? <Camera className="h-4 w-4" /> : <Play className="h-4 w-4" />} {t === "photo" ? "Photo" : "Video"}
                  </button>
                ))}
              </div>

              {form.type === "video" && (
                <div>
                  <label className={labelClass}>Video link *</label>
                  <input className={inputClass} value={form.videoUrl} placeholder="https://youtu.be/...  or  https://www.instagram.com/reel/..." onChange={(e) => set("videoUrl", e.target.value)} />
                  <p className={`mt-1 text-xs ${form.videoUrl.trim() && !video ? "text-red-500" : "text-slate-400"}`}>
                    {!form.videoUrl.trim()
                      ? "YouTube (including Shorts), Instagram reel or post, or a direct .mp4 link."
                      : video?.kind === "youtube"
                        ? "YouTube video ✓ (its thumbnail is used unless you upload a cover)"
                        : video?.kind === "instagram"
                          ? "Instagram video ✓ Upload a cover image below."
                          : video?.kind === "file"
                            ? "Video file ✓ (its first frame is used unless you upload a cover)"
                            : "This link isn't a YouTube, Instagram or .mp4 video."}
                  </p>
                </div>
              )}

              <div>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(u) => set("imageUrl", u)}
                  label={form.type === "photo" ? "Photo *" : `Cover image${video?.kind === "instagram" ? " *" : " (optional)"}`}
                  contentType="customer-gallery"
                />
                <p className="mt-1 text-xs text-slate-400">Portrait photos look best (4:5).</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Customer name *</label>
                  <input className={inputClass} value={form.customerName} maxLength={80} placeholder="Rahul & Priya" onChange={(e) => set("customerName", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Trip month (optional)</label>
                  <input className={inputClass} value={form.tripDate} maxLength={30} placeholder="Dec 2025" onChange={(e) => set("tripDate", e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Destination</label>
                <select className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="">Choose a state or country</option>
                  {locations.indiaStates.length > 0 && (
                    <optgroup label="India">
                      {locations.indiaStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  )}
                  {locations.internationalCountries.length > 0 && (
                    <optgroup label="International">
                      {locations.internationalCountries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  )}
                  <option value={OTHER}>Other (type it)</option>
                </select>
                {form.location === OTHER && (
                  <input className={`${inputClass} mt-2`} value={form.otherLocation} maxLength={80} placeholder="e.g. Gujarat" onChange={(e) => set("otherLocation", e.target.value)} />
                )}
                <p className="mt-1 text-xs text-slate-400">It also appears on that destination&apos;s page and its packages.</p>
              </div>

              <div>
                <label className={labelClass}>What they said (optional)</label>
                <textarea className={`${inputClass} min-h-[70px]`} value={form.quote} maxLength={220} placeholder="The houseboat night was the best part of our trip!" onChange={(e) => set("quote", e.target.value)} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Display order</label>
                  <input type="number" className={inputClass} value={form.order} onChange={(e) => set("order", e.target.value)} />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" className="h-4 w-4" checked={form.showOnHome} onChange={(e) => set("showOnHome", e.target.checked)} />
                  On home page
                </label>
                <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" className="h-4 w-4" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                  Show on website
                </label>
              </div>

              <label className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${form.consent ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                <input type="checkbox" className="mt-0.5 h-4 w-4" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
                <span>
                  <strong>The customer agreed</strong> to this photo or video being shown on our website. *
                </span>
              </label>
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

      {preview !== null && <MomentViewer moments={shown} index={preview} onIndex={setPreview} onClose={() => setPreview(null)} />}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete from gallery?"
        message="This will be removed from the website permanently. To hide it for now, use the eye button."
        confirmText="Delete"
      />
    </div>
  );
}
