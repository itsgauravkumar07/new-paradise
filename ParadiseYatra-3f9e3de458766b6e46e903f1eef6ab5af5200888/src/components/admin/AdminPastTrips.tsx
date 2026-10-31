"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { getImageUrl } from "@/lib/utils";
import { averageRating, type FDExperience, type FDReview } from "@/lib/fdExperiences";
import { AdminPageHeader, AdminSpinner, cardStyle, inputClass, labelClass } from "./hotels/shared";
import { chatAdminFetch as staffFetch } from "./chatShared";

const MAX_GALLERY = 12;
const MAX_REVIEWS = 20;
const MAX_IMAGE_BYTES = 220 * 1024; // same limit as the other admin image uploads

type Draft = Omit<FDExperience, "_id" | "fixedDeparture" | "gallery" | "highlights" | "reviews"> & {
  _id?: string;
  fixedDeparture: string;
  gallery: string[];
  highlightsText: string;
  reviews: FDReview[];
};

const emptyDraft = (): Draft => ({
  title: "",
  destination: "",
  tripDate: "",
  duration: "",
  groupSize: 0,
  coverImage: "",
  gallery: [],
  story: "",
  highlightsText: "",
  videoUrl: "",
  reviews: [],
  fixedDeparture: "",
  isActive: true,
  order: 0,
});

const toDraft = (t: FDExperience): Draft => ({
  _id: t._id,
  title: t.title,
  destination: t.destination,
  tripDate: t.tripDate || "",
  duration: t.duration || "",
  groupSize: t.groupSize || 0,
  coverImage: t.coverImage,
  gallery: t.gallery || [],
  story: t.story || "",
  highlightsText: (t.highlights || []).join("\n"),
  videoUrl: t.videoUrl || "",
  reviews: (t.reviews || []).map((r) => ({ ...r, location: r.location || "", photo: r.photo || "" })),
  fixedDeparture: typeof t.fixedDeparture === "object" && t.fixedDeparture ? t.fixedDeparture._id : t.fixedDeparture || "",
  isActive: t.isActive,
  order: t.order || 0,
});

const img = (src?: string) => (src ? getImageUrl(src) || src : "");

/** Uploads one image through the same endpoint as the other admin uploads; returns its URL. */
async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`"${file.name}" is larger than 220KB`);
  const form = new FormData();
  form.append("image", file);
  form.append("contentType", "fixed-departures");
  const res = await fetch("/api/upload/image", {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  const url = data.imageUrl || data.url || data.image;
  if (!res.ok || !url) throw new Error(data.message || data.error || "Upload failed");
  return url;
}

/** Small "upload a photo" tile for the gallery and reviewer photos. */
const UploadTile = ({
  onUploaded,
  multiple = false,
  label,
  size = "h-24 w-24",
}: {
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
  label: string;
  size?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        urls.push(await uploadImage(file));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (urls.length) onUploaded(urls);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={busy}
      className={`flex ${size} shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-[11px] font-semibold text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-wait`}
    >
      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      {busy ? "Uploading" : label}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </button>
  );
};

// ---------------------------------------------------------------- editor

const TripEditor = ({
  initial,
  departures,
  onCancel,
  onSaved,
}: {
  initial: Draft;
  departures: { _id: string; title: string; destination?: string }[];
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const setReview = (index: number, patch: Partial<FDReview>) =>
    setDraft((d) => ({ ...d, reviews: d.reviews.map((r, i) => (i === index ? { ...r, ...patch } : r)) }));

  const save = async () => {
    if (!draft.title.trim() || !draft.destination.trim()) return toast.error("Title and destination are required");
    if (!draft.coverImage) return toast.error("Please add a cover photo");
    const incomplete = draft.reviews.findIndex((r) => !r.name.trim() || !r.text.trim());
    if (incomplete >= 0) return toast.error(`Review ${incomplete + 1} needs a name and review text`);

    const body = {
      title: draft.title,
      destination: draft.destination,
      tripDate: draft.tripDate,
      duration: draft.duration,
      groupSize: draft.groupSize,
      coverImage: draft.coverImage,
      gallery: draft.gallery,
      story: draft.story,
      highlights: (draft.highlightsText || "")
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      videoUrl: draft.videoUrl,
      reviews: draft.reviews,
      fixedDeparture: draft.fixedDeparture || null,
      isActive: draft.isActive,
      order: draft.order,
    };

    setSaving(true);
    try {
      if (draft._id) {
        await staffFetch(`/api/fd-experiences/admin?id=${draft._id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await staffFetch("/api/fd-experiences", { method: "POST", body: JSON.stringify(body) });
      }
      toast.success(draft._id ? "Trip updated" : "Trip added");
      onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onCancel} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-indigo-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to trips
        </button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {draft._id ? "Save changes" : "Add trip"}
          </button>
        </div>
      </div>

      {/* Trip details */}
      <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
        <h2 className="mb-4 text-base font-bold text-slate-900">Trip details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Trip title *</label>
            <input className={inputClass} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Ladakh Bike Expedition – May 2026 Batch" />
          </div>
          <div>
            <label className={labelClass}>Destination *</label>
            <input className={inputClass} value={draft.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. Ladakh" />
            <p className="mt-1 text-[11px] text-slate-400">Shown on that destination&apos;s departure pages. Use the same name as the departures (e.g. &quot;Ladakh&quot;).</p>
          </div>
          <div>
            <label className={labelClass}>Linked fixed departure (optional)</label>
            <select className={inputClass} value={draft.fixedDeparture} onChange={(e) => set("fixedDeparture", e.target.value)}>
              <option value="">— None —</option>
              {departures.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Trip date</label>
            <input className={inputClass} value={draft.tripDate} onChange={(e) => set("tripDate", e.target.value)} placeholder="e.g. May 2026" />
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input className={inputClass} value={draft.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 6N/7D" />
          </div>
          <div>
            <label className={labelClass}>Group size (travellers)</label>
            <input type="number" min={0} className={inputClass} value={draft.groupSize || ""} onChange={(e) => set("groupSize", Number(e.target.value) || 0)} placeholder="e.g. 18" />
          </div>
          <div>
            <label className={labelClass}>Display order</label>
            <input type="number" className={inputClass} value={draft.order} onChange={(e) => set("order", Number(e.target.value) || 0)} />
            <p className="mt-1 text-[11px] text-slate-400">Lower numbers show first.</p>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Trip story</label>
            <textarea rows={5} className={inputClass} value={draft.story} onChange={(e) => set("story", e.target.value)} placeholder="How the trip went: the route, special moments, the group..." />
          </div>
          <div>
            <label className={labelClass}>Highlights (one per line)</label>
            <textarea rows={4} className={inputClass} value={draft.highlightsText} onChange={(e) => set("highlightsText", e.target.value)} placeholder={"Sunrise at Pangong Lake\nCamping in Nubra Valley"} />
          </div>
          <div>
            <label className={labelClass}>YouTube video link (optional)</label>
            <input className={inputClass} value={draft.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-indigo-600" />
              Show on the website
            </label>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
        <h2 className="mb-4 text-base font-bold text-slate-900">Photos</h2>
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ImageUpload label="Cover photo *" value={draft.coverImage} onChange={(url) => set("coverImage", url)} contentType="fixed-departures" />
          <div>
            <p className={labelClass}>
              Group gallery ({draft.gallery.length}/{MAX_GALLERY})
            </p>
            <div className="flex flex-wrap gap-3">
              {draft.gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={img(url)} alt="" fill sizes="96px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => set("gallery", draft.gallery.filter((_, j) => j !== i))}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/95 text-red-500 shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {draft.gallery.length < MAX_GALLERY && (
                <UploadTile
                  multiple
                  label="Add photos"
                  onUploaded={(urls) => setDraft((d) => ({ ...d, gallery: [...d.gallery, ...urls].slice(0, MAX_GALLERY) }))}
                />
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">You can select several photos at once. Max 220KB each.</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border bg-white p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Traveller reviews ({draft.reviews.length}/{MAX_REVIEWS})
          </h2>
          {draft.reviews.length < MAX_REVIEWS && (
            <button
              type="button"
              onClick={() => set("reviews", [...draft.reviews, { name: "", location: "", rating: 5, text: "", photo: "" }])}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
            >
              <Plus className="h-4 w-4" /> Add review
            </button>
          )}
        </div>

        {draft.reviews.length === 0 ? (
          <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500">No reviews yet. Add what travellers from this group said about the trip.</p>
        ) : (
          <ul className="space-y-4">
            {draft.reviews.map((r, i) => (
              <li key={r._id || i} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    {r.photo ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                        <Image src={img(r.photo)} alt="" fill sizes="64px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setReview(i, { photo: "" })}
                          aria-label="Remove photo"
                          className="absolute inset-x-0 bottom-0 cursor-pointer bg-slate-900/60 py-0.5 text-[10px] font-semibold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <UploadTile size="h-16 w-16" label="Photo" onUploaded={([url]) => setReview(i, { photo: url })} />
                    )}
                    <span className="text-[10px] text-slate-400">optional</span>
                  </div>

                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
                    <input className={inputClass} value={r.name} onChange={(e) => setReview(i, { name: e.target.value })} placeholder="Name *" />
                    <input className={inputClass} value={r.location || ""} onChange={(e) => setReview(i, { location: e.target.value })} placeholder="City (optional)" />
                    <select className={inputClass} value={r.rating} onChange={(e) => setReview(i, { rating: Number(e.target.value) })} aria-label="Rating">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {"★".repeat(n)} ({n})
                        </option>
                      ))}
                    </select>
                    <textarea rows={3} className={`${inputClass} sm:col-span-3`} value={r.text} onChange={(e) => setReview(i, { text: e.target.value })} placeholder="What they said about the trip *" />
                  </div>

                  <button
                    type="button"
                    onClick={() => set("reviews", draft.reviews.filter((_, j) => j !== i))}
                    aria-label="Delete review"
                    className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- list

const AdminPastTrips = () => {
  const [trips, setTrips] = useState<FDExperience[]>([]);
  const [departures, setDepartures] = useState<{ _id: string; title: string; destination?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<FDExperience | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await staffFetch<{ experiences: FDExperience[] }>("/api/fd-experiences/admin");
      setTrips(data.experiences || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load past trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/fixed-departures?limit=100", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d?.fixedDepartures || d?.data || [];
        if (Array.isArray(list)) setDepartures(list.map((x: { _id: string; title: string; destination?: string }) => ({ _id: x._id, title: x.title, destination: x.destination })));
      })
      .catch(() => undefined);
  }, [load]);

  const toggleActive = async (trip: FDExperience) => {
    try {
      await staffFetch(`/api/fd-experiences/admin?id=${trip._id}`, { method: "PUT", body: JSON.stringify({ isActive: !trip.isActive }) });
      setTrips((list) => list.map((t) => (t._id === trip._id ? { ...t, isActive: !t.isActive } : t)));
      toast.success(trip.isActive ? "Hidden from the website" : "Shown on the website");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const remove = async (trip: FDExperience) => {
    try {
      await staffFetch(`/api/fd-experiences/admin?id=${trip._id}`, { method: "DELETE" });
      setTrips((list) => list.filter((t) => t._id !== trip._id));
      toast.success("Trip deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setToDelete(null);
    }
  };

  if (editing) {
    return (
      <TripEditor
        initial={editing}
        departures={departures}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Camera}
        title="Past Group Trips"
        subtitle="Photos, stories and traveller reviews from earlier fixed departures, shown on the Fixed Departures pages."
        right={
          <button
            type="button"
            onClick={() => setEditing(emptyDraft())}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" /> Add past trip
          </button>
        }
      />

      {loading ? (
        <AdminSpinner label="Loading past trips..." />
      ) : trips.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center" style={cardStyle}>
          <p className="text-sm text-slate-500">No past trips yet. Add your first group trip with photos and reviews.</p>
          <button
            type="button"
            onClick={() => setEditing(emptyDraft())}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add past trip
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => {
            const rating = averageRating(t.reviews);
            return (
              <div key={t._id} className={`overflow-hidden rounded-2xl border bg-white ${t.isActive ? "" : "opacity-60"}`} style={cardStyle}>
                <div className="relative h-40 bg-slate-100">
                  {t.coverImage && <Image src={img(t.coverImage)} alt={t.title} fill sizes="400px" className="object-cover" />}
                  <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.isActive ? "bg-emerald-500 text-white" : "bg-slate-700 text-white"}`}>
                    {t.isActive ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-indigo-500">
                    <MapPin className="h-3 w-3" /> {t.destination}
                    {t.tripDate && <span className="text-slate-400"> · {t.tripDate}</span>}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-bold text-slate-900">{t.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {t.reviews.length ? `${rating.toFixed(1)} (${t.reviews.length})` : "No reviews"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5" /> {t.gallery.length + 1} photos
                    </span>
                    {!!t.groupSize && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {t.groupSize}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(toDraft(t))}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-50 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(t)}
                      title={t.isActive ? "Hide from website" : "Show on website"}
                      className="cursor-pointer rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
                    >
                      {t.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(t)}
                      title="Delete"
                      className="cursor-pointer rounded-xl border border-slate-200 px-3 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete this trip?"
        message={`"${toDelete?.title}" and its photos and reviews will be removed from the website.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminPastTrips;
