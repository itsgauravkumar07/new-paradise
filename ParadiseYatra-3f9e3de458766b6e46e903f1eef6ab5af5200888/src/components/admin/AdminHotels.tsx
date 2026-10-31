"use client";

import { useEffect, useMemo, useState } from "react";
import { Hotel as HotelIcon, Plus, Search, Pencil, Trash2, Star, X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { getImageUrl } from "@/lib/utils";
import { adminFetch, AdminPageHeader, AdminSpinner, cardStyle, inputClass, labelClass } from "./hotels/shared";
import { HOTEL_FEATURE_GROUPS, type HotelFeature } from "@/components/hotels/hotelFeatures";

interface HotelRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  pricePerNight: number;
  originalPricePerNight?: number;
  starRating: number;
  features?: HotelFeature[];
  amenities: string[];
  images: string[];
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface ImageSlot {
  id: string;
  url: string;
}

interface FormState {
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  address: string;
  shortDescription: string;
  description: string;
  pricePerNight: string;
  originalPricePerNight: string;
  starRating: number;
  features: HotelFeature[];
  amenities: string[];
  images: ImageSlot[];
  contactPhone: string;
  contactEmail: string;
  isActive: boolean;
  isFeatured: boolean;
}

const MAX_IMAGES = 6;
const AMENITY_SUGGESTIONS = [
  "Free WiFi", "Breakfast included", "Parking", "Swimming pool", "Restaurant", "Spa",
  "Room heater", "Air conditioning", "Airport transfer", "Bar", "Gym", "Mountain view",
];

let slotCounter = 0;
const newSlot = (url = ""): ImageSlot => ({ id: `slot-${Date.now()}-${slotCounter++}`, url });

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const emptyForm = (): FormState => ({
  name: "", slug: "", city: "", state: "", country: "India", address: "",
  shortDescription: "", description: "", pricePerNight: "", originalPricePerNight: "",
  starRating: 3, features: [], amenities: [], images: [newSlot()], contactPhone: "", contactEmail: "",
  isActive: true, isFeatured: false,
});

const toForm = (h: HotelRow): FormState => ({
  name: h.name, slug: h.slug, city: h.city, state: h.state || "", country: h.country || "India",
  address: h.address || "", shortDescription: h.shortDescription, description: h.description,
  pricePerNight: String(h.pricePerNight), originalPricePerNight: h.originalPricePerNight ? String(h.originalPricePerNight) : "",
  starRating: h.starRating, features: h.features || [], amenities: h.amenities || [],
  images: (h.images?.length ? h.images : [""]).map((u) => newSlot(u)),
  contactPhone: h.contactPhone || "", contactEmail: h.contactEmail || "",
  isActive: h.isActive, isFeatured: h.isFeatured,
});

const AdminHotels = () => {
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const [editing, setEditing] = useState<HotelRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<HotelRow | null>(null);

  const load = async () => {
    try {
      const data = await adminFetch<{ hotels: HotelRow[] }>("admin/all");
      setHotels(data.hotels || []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hotels.filter((h) => {
      const matches = !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
      const state = filter === "all" || (filter === "active" ? h.isActive : !h.isActive);
      return matches && state;
    });
  }, [hotels, search, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setAmenityInput("");
    setShowForm(true);
  };
  const openEdit = (h: HotelRow) => {
    setEditing(h);
    setForm(toForm(h));
    setSlugTouched(true);
    setAmenityInput("");
    setShowForm(true);
  };
  const closeForm = () => { if (!saving) setShowForm(false); };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const addAmenity = (raw: string) => {
    const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return;
    setForm((f) => {
      const have = new Set(f.amenities.map((a) => a.toLowerCase()));
      const add = items.filter((a) => !have.has(a.toLowerCase()));
      return { ...f, amenities: [...f.amenities, ...add] };
    });
    setAmenityInput("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.pricePerNight);
    const original = form.originalPricePerNight ? Number(form.originalPricePerNight) : undefined;

    if (!form.name.trim() || !form.city.trim()) return toast.error("Hotel name and city are required.");
    if (!form.shortDescription.trim() || !form.description.trim()) return toast.error("Please add both descriptions.");
    if (!form.pricePerNight || Number.isNaN(price) || price <= 0) return toast.error("Enter a valid price per night.");
    if (original !== undefined && (Number.isNaN(original) || original <= price)) {
      return toast.error("Original price must be higher than the selling price (or leave it empty).");
    }
    const images = form.images.map((i) => i.url.trim()).filter(Boolean);
    if (images.length === 0) return toast.error("Please upload at least one hotel image.");

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim() || "India",
      address: form.address.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      pricePerNight: price,
      originalPricePerNight: original ?? null,
      starRating: form.starRating,
      features: form.features,
      amenities: form.amenities,
      images,
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    setSaving(true);
    try {
      if (editing) {
        await adminFetch(editing._id, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Hotel updated");
      } else {
        await adminFetch("", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Hotel added");
      }
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save hotel");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (h: HotelRow) => {
    try {
      await adminFetch(h._id, { method: "PUT", body: JSON.stringify({ isActive: !h.isActive }) });
      setHotels((prev) => prev.map((x) => (x._id === h._id ? { ...x, isActive: !h.isActive } : x)));
      toast.success(h.isActive ? "Hotel hidden from the website" : "Hotel is now live");
    } catch (err) {
      toast.error((err as Error).message || "Failed to update");
    }
  };

  const remove = async (h: HotelRow) => {
    try {
      await adminFetch(h._id, { method: "DELETE" });
      setHotels((prev) => prev.filter((x) => x._id !== h._id));
      toast.success("Hotel deleted");
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete");
    }
  };

  if (loading) return <AdminSpinner label="Loading hotels..." />;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon={HotelIcon}
        title="Hotels"
        subtitle="Add and manage the hotels shown on the /hotels pages"
        right={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#6366f1" }}>
            <Plus className="w-4 h-4" /> Add hotel
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border bg-white" style={cardStyle}>
        <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
        <input
          type="text" placeholder="Search by hotel name or city..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px] outline-none text-sm"
        />
        <div className="flex gap-1.5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 text-slate-400 text-sm bg-white rounded-2xl border" style={cardStyle}>
          {hotels.length === 0 ? "No hotels yet. Click \"Add hotel\" to create the first one." : "No hotels match your search."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => {
            const thumb = getImageUrl(h.images?.[0] || null);
            return (
              <div key={h._id} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 rounded-2xl border bg-white" style={cardStyle}>
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {thumb && <img src={thumb} alt={h.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{h.name}</h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${h.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                      {h.isActive ? "Live" : "Hidden"}
                    </span>
                    {h.isFeatured && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Featured</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {[h.city, h.state].filter(Boolean).join(", ")} · {h.starRating}
                    <Star className="inline w-3 h-3 -mt-0.5 ml-0.5 fill-amber-400 text-amber-400" /> · ₹{h.pricePerNight.toLocaleString("en-IN")}/night
                  </p>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  <button onClick={() => toggleActive(h)} title={h.isActive ? "Hide from website" : "Show on website"} className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100">
                    {h.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(h)} title="Edit" className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setToDelete(h)} title="Delete" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / edit form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && closeForm()}>
          <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editing ? `Edit ${editing.name}` : "Add hotel"}</h2>
              <button type="button" onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Close"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Hotel name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
              </div>
              <div>
                <label className={labelClass}>URL slug</label>
                <input className={inputClass} value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} placeholder="auto-from-name" />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Star rating</label>
                <select className={inputClass} value={form.starRating} onChange={(e) => set("starRating", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Price per night (₹) *</label>
                <input type="number" min={1} className={inputClass} value={form.pricePerNight} onChange={(e) => set("pricePerNight", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Original price (₹) - optional, shows a discount</label>
                <input type="number" min={1} className={inputClass} value={form.originalPricePerNight} onChange={(e) => set("originalPricePerNight", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Short description * (shown on cards)</label>
                <input className={inputClass} maxLength={160} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Full description *</label>
                <textarea rows={5} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Stay features</label>
                <p className="text-xs text-slate-500 mb-3">Select what this hotel actually includes. Guests can use these to filter their search.</p>
                <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                  {HOTEL_FEATURE_GROUPS.map((group) => (
                    <fieldset key={group.title}>
                      <legend className="text-sm font-bold text-slate-700 mb-2">{group.title}</legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.features.map((feature) => (
                          <label key={feature.value} className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={form.features.includes(feature.value)}
                              onChange={(e) => set(
                                "features",
                                e.target.checked
                                  ? [...form.features, feature.value]
                                  : form.features.filter((value) => value !== feature.value)
                              )}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                            />
                            {feature.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Amenities</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                      {a}
                      <button type="button" aria-label={`Remove ${a}`} onClick={() => set("amenities", form.amenities.filter((x) => x !== a))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <input
                  className={inputClass} placeholder="Type an amenity and press Enter" value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addAmenity(amenityInput); } }}
                  onBlur={() => addAmenity(amenityInput)}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {AMENITY_SUGGESTIONS.filter((s) => !form.amenities.some((a) => a.toLowerCase() === s.toLowerCase())).map((s) => (
                    <button key={s} type="button" onClick={() => addAmenity(s)} className="text-xs font-semibold text-slate-500 border border-dashed border-slate-300 px-2.5 py-1 rounded-full hover:border-indigo-400 hover:text-indigo-600">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Images (first one is the cover, max {MAX_IMAGES}, 220KB each)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.images.map((slot, idx) => (
                    <div key={slot.id} className="relative">
                      <ImageUpload
                        value={slot.url}
                        label={idx === 0 ? "Cover image" : `Image ${idx + 1}`}
                        contentType="hotels"
                        onChange={(url) => setForm((f) => ({ ...f, images: f.images.map((s) => (s.id === slot.id ? { ...s, url } : s)) }))}
                      />
                      {form.images.length > 1 && (
                        <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((s) => s.id !== slot.id) }))} className="absolute top-0 right-0 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                          Remove slot
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.images.length < MAX_IMAGES && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: [...f.images, newSlot()] }))} className="mt-3 text-sm font-bold text-indigo-600 hover:underline">
                    + Add another image
                  </button>
                )}
              </div>

              <div>
                <label className={labelClass}>Contact phone</label>
                <input className={inputClass} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Contact email</label>
                <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4" />
                Show on website
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4" />
                Featured (listed first)
              </label>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
              <button type="button" onClick={closeForm} disabled={saving} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: "#6366f1" }}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add hotel"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove(toDelete)}
        title="Delete hotel?"
        message={`"${toDelete?.name}" will be removed permanently. To only hide it from the website, use the eye button instead.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default AdminHotels;
