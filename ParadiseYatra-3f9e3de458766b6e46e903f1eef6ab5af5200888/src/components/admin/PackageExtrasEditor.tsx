"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Info, Loader2, Luggage, Trash2, Images, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/lib/utils";

const MAX_IMAGE_BYTES = 220 * 1024; // same limit as the other admin image uploads
export const MAX_GALLERY_PHOTOS = 12; // matches the backend limit

async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`"${file.name}" is larger than 220KB`);
  const form = new FormData();
  form.append("image", file);
  form.append("contentType", "packages");
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

interface ListCardProps {
  title: string;
  hint: string;
  icon: React.ReactNode;
  items: string[];
  placeholder: string;
  onSave: (items: string[]) => Promise<void>;
}

/** View / edit a simple list of short notes (one per line). */
function ListCard({ title, hint, icon, items, placeholder, onSave }: ListCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(items);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(items);
  }, [items, editing]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft.map((d) => d.trim()).filter(Boolean));
      setEditing(false);
    } catch {
      // The error banner is shown by the parent; keep the draft open so nothing typed is lost
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all ${editing ? "border-blue-500 bg-white shadow-sm" : "border-gray-50 bg-gray-50/30 hover:bg-gray-50"}`}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-gray-900">{icon} {title}</h3>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        ) : (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button size="sm" className="bg-blue-600" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      <p className="mb-4 text-xs text-gray-500">{hint}</p>
      {editing ? (
        <div className="space-y-2">
          {draft.map((value, i) => (
            <div key={i} className="flex gap-2">
              <Input
                className="!bg-white"
                value={value}
                placeholder={placeholder}
                onChange={(e) => setDraft((d) => d.map((v, idx) => (idx === i ? e.target.value : v)))}
              />
              <Button variant="ghost" size="sm" onClick={() => setDraft((d) => d.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setDraft((d) => [...d, ""])}>+ Add point</Button>
        </div>
      ) : items.length ? (
        <ul className="space-y-2">
          {items.slice(0, 5).map((v, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />{v}</li>
          ))}
          {items.length > 5 && <li className="text-xs font-medium text-blue-500">+ {items.length - 5} more</li>}
        </ul>
      ) : (
        <p className="text-sm italic text-gray-400">Nothing added yet. This section is hidden on the website until you add points.</p>
      )}
    </div>
  );
}

/** Upload, reorder and remove the package's gallery photos. Saves straight away. */
function GalleryCard({ items, onSave }: { items: string[]; onSave: (items: string[]) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (next: string[]) => {
    setBusy(true);
    setError(null);
    try {
      await onSave(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the gallery");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_GALLERY_PHOTOS - items.length;
    const chosen = Array.from(files).slice(0, room);
    setBusy(true);
    setError(null);
    const urls: string[] = [];
    const problems: string[] = [];
    for (const file of chosen) {
      try {
        urls.push(await uploadImage(file));
      } catch (e) {
        problems.push(e instanceof Error ? e.message : "Upload failed");
      }
    }
    if (inputRef.current) inputRef.current.value = "";
    if (files.length > room) problems.push(`Only ${MAX_GALLERY_PHOTOS} photos are allowed, so ${files.length - room} were skipped.`);
    setBusy(false);
    if (urls.length) await update([...items, ...urls]);
    if (problems.length) setError(problems.join(" "));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
  };

  return (
    <div className="rounded-2xl border-2 border-gray-50 bg-gray-50/30 p-6 lg:col-span-2">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-gray-900"><Images className="h-5 w-5 text-indigo-500" /> Gallery photos</h3>
        <span className="text-xs font-semibold text-gray-500">{items.length} / {MAX_GALLERY_PHOTOS}</span>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Shown on the package page after the main image. JPG/PNG/WebP up to 220KB each. Until you add photos, the page uses the main image and the itinerary day photos.
      </p>
      <div className="flex flex-wrap gap-3">
        {items.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative h-24 w-32 overflow-hidden rounded-xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl(url) || url} alt={`Gallery photo ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, i - 1)} aria-label="Move left" className="rounded bg-white/90 p-1 disabled:opacity-40"><ArrowLeft className="h-3 w-3" /></button>
                <button type="button" disabled={busy || i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="Move right" className="rounded bg-white/90 p-1 disabled:opacity-40"><ArrowRight className="h-3 w-3" /></button>
              </div>
              <button type="button" disabled={busy} onClick={() => update(items.filter((_, idx) => idx !== i))} aria-label="Remove photo" className="rounded bg-white/90 p-1 text-red-600"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        {items.length < MAX_GALLERY_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-[11px] font-semibold text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-wait"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {busy ? "Saving..." : "Add photos"}
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

interface PackageExtrasEditorProps {
  gallery: string[];
  knowBeforeYouGo: string[];
  thingsToCarry: string[];
  /** Saves one field on the package (PUT to the package) and refreshes the selection. */
  onSave: (payload: Record<string, string[]>, message: string) => Promise<void>;
}

/** Gallery, "Know before you go" and "Things to carry" for a package (Admin > Itinerary). */
export default function PackageExtrasEditor({ gallery, knowBeforeYouGo, thingsToCarry, onSave }: PackageExtrasEditorProps) {
  return (
    <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GalleryCard items={gallery} onSave={(list) => onSave({ gallery: list }, "Gallery saved!")} />
      <ListCard
        title="Know before you go"
        hint="Important notes: ID proof, permits, weather, road conditions, check-in times..."
        icon={<Info className="h-5 w-5 text-sky-500" />}
        items={knowBeforeYouGo}
        placeholder="e.g. Carry a government photo ID for hotel check-in"
        onSave={(list) => onSave({ knowBeforeYouGo: list }, "Know before you go saved!")}
      />
      <ListCard
        title="Things to carry"
        hint="A packing list for this trip."
        icon={<Luggage className="h-5 w-5 text-amber-500" />}
        items={thingsToCarry}
        placeholder="e.g. Warm jacket and gloves"
        onSave={(list) => onSave({ thingsToCarry: list }, "Things to carry saved!")}
      />
    </div>
  );
}
