"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  Globe,
  Plane,
  Mountain,
  Search,
  ChevronRight,
  ChevronDown,
  Star,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import PackageExtrasEditor from "@/components/admin/PackageExtrasEditor";

interface DayItinerary {
  day: number;
  title: string;
  activities: string[];
  image: string;
}

interface FixedDeparture {
  _id: string;
  title: string;
  slug: string;
  itinerary: DayItinerary[];
  duration: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: number;
  status: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  terms?: string[];
  image?: string;
  country?: string;
  state?: string;
  tourType?: string;
  tags?: string[];
}

interface PopularDestinationPackage {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  location: string;
  country: string;
  state: string;
  tourType: 'international' | 'india';
  category: string;
  rating: number;
  price: number;
  duration: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  terms?: string[];
  gallery?: string[];
  knowBeforeYouGo?: string[];
  thingsToCarry?: string[];
  isActive: boolean;
  isTrending: boolean;
  visitCount: number;
  itinerary: DayItinerary[];
  tags?: string[];
}

type ItemType = 'fixed-departure' | 'all-package';

interface SelectedItem {
  type: ItemType;
  data: PopularDestinationPackage | FixedDeparture;
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const containsHtml = (value: string = ""): boolean => /<\/?[a-z][\s\S]*>/i.test(value);

const activitiesToHtml = (activities: string[]) => {
  const cleanActivities = activities.filter((item) => item.trim());
  if (cleanActivities.length === 0) return "<p></p>";
  if (cleanActivities.length === 1 && containsHtml(cleanActivities[0])) {
    return cleanActivities[0];
  }
  return `<ul>${cleanActivities
    .map((item) => `<li>${containsHtml(item) ? item : escapeHtml(item)}</li>`)
    .join("")}</ul>`;
};

const htmlToActivities = (html: string): string[] => {
  if (!html.trim() || typeof window === "undefined") return [];
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const textContent = (parsed.body?.textContent || "").trim();
  const hasMedia =
    parsed.body?.querySelector("img, table, iframe, video, audio, ul, ol") !== null;

  if (!textContent && !hasMedia) return [];
  return [html];
};

const AdminItinerary = () => {
  const [fixedDepartures, setFixedDepartures] = useState<FixedDeparture[]>([]);
  const [allPackages, setAllPackages] = useState<PopularDestinationPackage[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDay, setEditingDay] = useState<DayItinerary | null>(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ItemType>('all-package');

  // Edit Sections States
  const [isEditingHighlights, setIsEditingHighlights] = useState(false);
  const [packageHighlights, setPackageHighlights] = useState<string[]>([]);
  const [isEditingInclusions, setIsEditingInclusions] = useState(false);
  const [packageInclusions, setPackageInclusions] = useState<string[]>([]);
  const [isEditingExclusions, setIsEditingExclusions] = useState(false);
  const [packageExclusions, setPackageExclusions] = useState<string[]>([]);
  const [editingActivitiesHtml, setEditingActivitiesHtml] = useState("<p></p>");
  const [newDayActivitiesHtml, setNewDayActivitiesHtml] = useState("<p></p>");
  const [newDay, setNewDay] = useState<Partial<DayItinerary>>({
    day: 1,
    title: "",
    activities: [""],
    image: ""
  });

  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTourType, setSelectedTourType] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Derived unique values for filters
  const uniqueCountries = useMemo(() => {
    const list = activeTab === 'all-package' ? allPackages : fixedDepartures;
    const countries = new Set(list.map(item => (item as any).country).filter(Boolean));
    return Array.from(countries).sort();
  }, [allPackages, fixedDepartures, activeTab]);

  const uniqueStates = useMemo(() => {
    const list = activeTab === 'all-package' ? allPackages : fixedDepartures;
    const states = new Set(list.map(item => (item as any).state).filter(Boolean));
    return Array.from(states).sort();
  }, [allPackages, fixedDepartures, activeTab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const [fixedDeparturesResponse, allPackagesResponse, tagsResponse] = await Promise.all([
        fetch('/api/fixed-departures', { headers, cache: 'no-store' }),
        fetch('/api/all-packages?limit=60', { headers, cache: 'no-store' }),
        fetch('/api/tags', { headers, cache: 'no-store' })
      ]);

      if (!fixedDeparturesResponse.ok) throw new Error('Failed to fetch fixed departures');
      if (!allPackagesResponse.ok) throw new Error('Failed to fetch all packages');
      if (!tagsResponse.ok) throw new Error('Failed to fetch tags');

      const fixedDeparturesData = await fixedDeparturesResponse.json();
      const allPackagesData = await allPackagesResponse.json();
      const tagsData = await tagsResponse.json();

      setAllTags(Array.isArray(tagsData) ? tagsData : (tagsData.tags || []));

      const fixedDeparturesArray = Array.isArray(fixedDeparturesData)
        ? fixedDeparturesData
        : Array.isArray(fixedDeparturesData?.fixedDepartures)
          ? fixedDeparturesData.fixedDepartures
          : [];

      const normalizedFixedDepartures = fixedDeparturesArray.map((departure: any) => ({
        ...departure,
        itinerary: Array.isArray(departure.itinerary) ? departure.itinerary : []
      }));
      setFixedDepartures(normalizedFixedDepartures);

      const allPackagesArray = Array.isArray(allPackagesData)
        ? allPackagesData
        : Array.isArray(allPackagesData?.packages)
          ? allPackagesData.packages
          : [];

      const normalizedAllPackages = allPackagesArray.map((pkg: any) => ({
        ...pkg,
        itinerary: Array.isArray(pkg.itinerary) ? pkg.itinerary : []
      }));
      setAllPackages(normalizedAllPackages);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeItemData = (item: any) => ({
    ...item,
    itinerary: Array.isArray(item?.itinerary) ? item.itinerary : [],
    highlights: Array.isArray(item?.highlights) ? item.highlights : [],
    inclusions: Array.isArray(item?.inclusions) ? item.inclusions : [],
    exclusions: Array.isArray(item?.exclusions) ? item.exclusions : [],
    terms: Array.isArray(item?.terms) ? item.terms : [],
  });

  const handleItemSelect = (type: ItemType, item: any) => {
    const normalized = normalizeItemData(item);
    setSelectedItem({
      type,
      data: normalized
    });
    setPackageHighlights(normalized.highlights || []);
    setPackageInclusions(normalized.inclusions || []);
    setPackageExclusions(normalized.exclusions || []);
    setIsEditing(false);
    setEditingDay(null);
    setEditingActivitiesHtml("<p></p>");
    setIsAddingDay(false);
    setError(null);
    setSuccess(null);
    setNewDayActivitiesHtml("<p></p>");
    setNewDay({ day: 1, title: "", activities: [""], image: "" });
    // Scroll to details
    setTimeout(() => {
      document.getElementById('itinerary-details')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredItems = useMemo(() => {
    const list = activeTab === 'all-package' ? allPackages : fixedDepartures;
    return list.filter(item => {
      const name = ((item as any).name || (item as any).title || "").toString();
      const location = ((item as any).location || (item as any).destination || "").toString();
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const itemTags = (item as any).tags || [];
      const matchesTag = !selectedTag || itemTags.includes(selectedTag);

      const matchesTourType = !selectedTourType || (item as any).tourType === selectedTourType;
      const matchesCountry = !selectedCountry || (item as any).country === selectedCountry;
      const matchesState = !selectedState || (item as any).state === selectedState;

      return matchesSearch && matchesTag && matchesTourType && matchesCountry && matchesState;
    });
  }, [activeTab, allPackages, fixedDepartures, searchTerm, selectedTag, selectedTourType, selectedCountry, selectedState]);

  const persistSelectedItem = async (
    payload: Record<string, unknown>,
    successMessage: string,
    clearEditState?: () => void
  ) => {
    if (!selectedItem) return;

    const endpoint = selectedItem.type === 'fixed-departure'
      ? `/api/fixed-departures/${selectedItem.data._id}`
      : `/api/all-packages/${selectedItem.data._id}`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to save itinerary data');
    }

    const updatedData = await response.json();
    const updatedItem = updatedData.package || updatedData.fixedDeparture || updatedData;
    const normalized = normalizeItemData(updatedItem);

    setSelectedItem({ type: selectedItem.type, data: normalized });
    if (selectedItem.type === 'fixed-departure') {
      setFixedDepartures(prev => prev.map(p => p._id === normalized._id ? normalized : p));
    } else {
      setAllPackages(prev => prev.map(p => p._id === normalized._id ? normalized : p));
    }

    setPackageHighlights(normalized.highlights || []);
    setPackageInclusions(normalized.inclusions || []);
    setPackageExclusions(normalized.exclusions || []);
    clearEditState?.();
    setSuccess(successMessage);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveDay = async () => {
    if (!selectedItem || !editingDay) return;
    try {
      setIsSaving(true);
      setError(null);

      const parsedActivities = htmlToActivities(editingActivitiesHtml);
      if (!editingDay.title.trim()) {
        setError('Day title is required');
        return;
      }
      if (parsedActivities.length === 0) {
        setError('Add at least one activity');
        return;
      }

      const updatedItinerary = (selectedItem.data.itinerary || []).map(day =>
        day.day === editingDay.day ? { ...editingDay, activities: parsedActivities } : day
      );
      await persistSelectedItem(
        { itinerary: updatedItinerary },
        'Day updated successfully!',
        () => {
          setIsEditing(false);
          setEditingDay(null);
          setEditingActivitiesHtml("<p></p>");
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update day');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDay = async (dayNumber: number) => {
    if (!selectedItem || !confirm(`Delete Day ${dayNumber}?`)) return;
    try {
      setIsSaving(true);
      setError(null);
      const updatedItinerary = (selectedItem.data.itinerary || [])
        .filter(day => day.day !== dayNumber)
        .map((day, index) => ({ ...day, day: index + 1 }));

      await persistSelectedItem({ itinerary: updatedItinerary }, 'Day deleted!');
    } catch (error) {
      setError('Failed to delete day');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDay = async () => {
    if (!selectedItem || !newDay.title) return;
    const validActivities = htmlToActivities(newDayActivitiesHtml);
    if (validActivities.length === 0) {
      setError('Add at least one activity');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const dayToAdd = {
        day: (selectedItem.data.itinerary || []).length + 1,
        title: newDay.title.trim(),
        activities: validActivities,
        image: ""
      };
      const updatedItinerary = [...(selectedItem.data.itinerary || []), dayToAdd];

      await persistSelectedItem(
        { itinerary: updatedItinerary },
        'Day added!',
        () => {
          setIsAddingDay(false);
          setNewDay({ day: 1, title: "", activities: [""], image: "" });
          setNewDayActivitiesHtml("<p></p>");
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add day');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHighlights = async () => {
    if (!selectedItem) return;
    try {
      setIsSaving(true);
      setError(null);
      await persistSelectedItem(
        { highlights: packageHighlights.filter(h => h.trim()) },
        'Highlights saved!',
        () => setIsEditingHighlights(false)
      );
    } catch (e) { setError('Failed to save highlights'); } finally { setIsSaving(false); }
  };

  const handleSaveInclusions = async () => {
    if (!selectedItem) return;
    try {
      setIsSaving(true);
      setError(null);
      await persistSelectedItem(
        { inclusions: packageInclusions.filter(i => i.trim()) },
        'Inclusions saved!',
        () => setIsEditingInclusions(false)
      );
    } catch (e) { setError('Failed to save inclusions'); } finally { setIsSaving(false); }
  };

  const handleSaveExclusions = async () => {
    if (!selectedItem) return;
    try {
      setIsSaving(true);
      setError(null);
      await persistSelectedItem(
        { exclusions: packageExclusions.filter(e => e.trim()) },
        'Exclusions saved!',
        () => setIsEditingExclusions(false)
      );
    } catch (e) { setError('Failed to save exclusions'); } finally { setIsSaving(false); }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="!text-3xl font-bold text-gray-900">Itinerary Management</h1>
                <p className="!text-gray-500 mt-1">Design and customize daily travel experiences</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-4 py-2 rounded-xl bg-blue-50 !text-blue-700 border-blue-100">
                {allPackages.length} Admin Packages
              </Badge>
              <Badge variant="outline" className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border-purple-100">
                {fixedDepartures.length} Fixed Departures
              </Badge>
            </div>
          </div>
        </div>

        {/* Messaging */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0" /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Area */}
        <Card className="rounded-3xl shadow-sm border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex p-1 bg-gray-100 rounded-2xl w-full md:w-auto">
                  <button
                    onClick={() => { setActiveTab('all-package'); setSelectedItem(null); setSelectedTag(null); }}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'all-package' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Admin Packages
                  </button>
                  <button
                    onClick={() => { setActiveTab('fixed-departure'); setSelectedItem(null); setSelectedTag(null); }}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'fixed-departure' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Fixed Departures
                  </button>
                </div>

                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder={`Search by name or location...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-6 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  <span className="text-xs font-bold text-gray-400 mr-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> TAGS:
                  </span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${!selectedTag ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    All
                  </button>
                  {allTags.slice(0, 8).map(tag => (
                    <button
                      key={tag._id}
                      onClick={() => setSelectedTag(selectedTag === tag._id ? null : tag._id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${selectedTag === tag._id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 ml-1">TOUR TYPE</span>
                    <select
                      value={selectedTourType || ""}
                      onChange={(e) => setSelectedTourType(e.target.value || null)}
                      className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">All Types</option>
                      <option value="india">India</option>
                      <option value="international">International</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 ml-1">COUNTRY</span>
                    <select
                      value={selectedCountry || ""}
                      onChange={(e) => setSelectedCountry(e.target.value || null)}
                      className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">All Countries</option>
                      {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 ml-1">STATE</span>
                    <select
                      value={selectedState || ""}
                      onChange={(e) => setSelectedState(e.target.value || null)}
                      className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">All States</option>
                      {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTag(null);
                      setSelectedTourType(null);
                      setSelectedCountry(null);
                      setSelectedState(null);
                      setSearchTerm("");
                    }}
                    className="mt-4 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    CLEAR ALL
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredItems.map((item) => {
                const title = 'name' in item ? item.name : item.title;
                const loc = 'location' in item ? item.location : item.destination;
                const img = item.image;
                const isSel = selectedItem?.data._id === item._id;

                return (
                  <button
                    key={item._id}
                    onClick={() => handleItemSelect(activeTab, item)}
                    className={`group relative text-left rounded-2xl border-2 transition-all overflow-hidden ${isSel ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50' : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg'}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {img ? <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Mountain className="w-8 h-8" /></div>}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 truncate">{title}</h4>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 font-medium capitalize">
                        <MapPin className="w-3 h-3 text-blue-500" /> {loc} • {item.duration}
                      </div>
                    </div>
                    {isSel && <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg"><CheckCircle className="w-4 h-4" /></div>}
                  </button>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No items found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Selected Package Details & Itinerary Editor */}
        {selectedItem && (
          <div id="itinerary-details" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-3xl shadow-md border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-slate-800 p-8 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600 border-none px-4 py-1">Editing Itinerary</Badge>
                    <h2 className="!text-3xl !font-bold font-royal">{'name' in selectedItem.data ? selectedItem.data.name : selectedItem.data.title}</h2>
                    <div className="flex items-center gap-6 text-gray-300 text-sm">
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {selectedItem.data.duration}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {'location' in selectedItem.data ? selectedItem.data.location : selectedItem.data.destination}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setIsAddingDay(true);
                      setIsEditing(false);
                      setEditingDay(null);
                      setNewDayActivitiesHtml("<p></p>");
                      setNewDay({ day: (selectedItem.data.itinerary || []).length + 1, title: "", activities: [""] });
                    }}
                    className="hidden md:flex bg-white !text-gray-900 hover:bg-gray-100 rounded-2xl px-4 py-4 font-bold gap-2 shadow-xl"
                  >
                    <Plus className="w-5 h-5 !text-blue-600" /> Add Day {(selectedItem.data.itinerary || []).length + 1}
                  </Button>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Metadata Sections Grid */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-700">Package Sections</h3>
                  <p className="text-xs text-gray-500">
                    Edit highlights, inclusions, exclusions, gallery, Know before you go, Things to carry and the itinerary.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                  {/* Highlights */}
                  <div className={`p-6 rounded-2xl border-2 transition-all ${isEditingHighlights ? 'border-blue-500 bg-blue-50/30' : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Highlights</h3>
                      {!isEditingHighlights ? (
                        <Button variant="ghost" size="sm" onClick={() => { setPackageHighlights(selectedItem.data.highlights || []); setIsEditingHighlights(true); }}>Edit</Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingHighlights(false)}>Cancel</Button>
                          <Button size="sm" className="bg-blue-600" onClick={handleSaveHighlights}>Save</Button>
                        </div>
                      )}
                    </div>
                    {isEditingHighlights ? (
                      <div className="space-y-2">
                        {packageHighlights.map((h, i) => (
                          <div key={i} className="flex gap-2">
                            <Input className="!bg-white" value={h} onChange={(e) => { const nh = [...packageHighlights]; nh[i] = e.target.value; setPackageHighlights(nh); }} />
                            <Button variant="ghost" size="sm" onClick={() => setPackageHighlights(packageHighlights.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setPackageHighlights([...packageHighlights, ""])}>+ Add Highlight</Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {(selectedItem.data.highlights || []).slice(0, 5).map((h, i) => (
                          <li key={i} className="text-sm text-gray-600 flex  items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />{h}</li>
                        ))}
                        {(selectedItem.data.highlights || []).length > 5 && <li className="text-xs text-blue-500 font-medium">+ {(selectedItem.data.highlights || []).length - 5} more</li>}
                      </ul>
                    )}
                  </div>

                  {/* Inclusions */}
                  <div className={`p-6 rounded-2xl border-2 transition-all ${isEditingInclusions ? 'border-green-500 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Inclusions</h3>
                      {!isEditingInclusions ? (
                        <Button variant="ghost" size="sm" onClick={() => { setPackageInclusions(selectedItem.data.inclusions || []); setIsEditingInclusions(true); }}>Edit</Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingInclusions(false)}>Cancel</Button>
                          <Button size="sm" className="bg-green-600" onClick={handleSaveInclusions}>Save</Button>
                        </div>
                      )}
                    </div>
                    {isEditingInclusions ? (
                      <div className="space-y-2">
                        {packageInclusions.map((v, i) => (
                          <div key={i} className="flex gap-2">
                            <Input className="!bg-white" value={v} onChange={(e) => { const nv = [...packageInclusions]; nv[i] = e.target.value; setPackageInclusions(nv); }} />
                            <Button variant="ghost" size="sm" onClick={() => setPackageInclusions(packageInclusions.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setPackageInclusions([...packageInclusions, ""])}>+ Add Inclusion</Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {(selectedItem.data.inclusions || []).slice(0, 5).map((v, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5" />{v}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Exclusions */}
                  <div className={`p-6 rounded-2xl border-2 transition-all ${isEditingExclusions ? 'border-red-500 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><X className="w-5 h-5 text-red-500" /> Exclusions</h3>
                      {!isEditingExclusions ? (
                        <Button variant="ghost" size="sm" onClick={() => { setPackageExclusions(selectedItem.data.exclusions || []); setIsEditingExclusions(true); }}>Edit</Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setIsEditingExclusions(false)}>Cancel</Button>
                          <Button size="sm" className="bg-red-600" onClick={handleSaveExclusions}>Save</Button>
                        </div>
                      )}
                    </div>
                    {isEditingExclusions ? (
                      <div className="space-y-2">
                        {packageExclusions.map((v, i) => (
                          <div key={i} className="flex gap-2">
                            <Input className="!bg-white" value={v} onChange={(e) => { const nv = [...packageExclusions]; nv[i] = e.target.value; setPackageExclusions(nv); }} />
                            <Button variant="ghost" size="sm" onClick={() => setPackageExclusions(packageExclusions.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setPackageExclusions([...packageExclusions, ""])}>+ Add Exclusion</Button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {(selectedItem.data.exclusions || []).slice(0, 5).map((v, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />{v}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {selectedItem.type === 'all-package' && (
                  <PackageExtrasEditor
                    gallery={(selectedItem.data as PopularDestinationPackage).gallery || []}
                    knowBeforeYouGo={(selectedItem.data as PopularDestinationPackage).knowBeforeYouGo || []}
                    thingsToCarry={(selectedItem.data as PopularDestinationPackage).thingsToCarry || []}
                    onSave={async (payload, message) => {
                      setError(null);
                      try {
                        await persistSelectedItem(payload, message);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Failed to save');
                        throw e;
                      }
                    }}
                  />
                )}

                <div className="space-y-8">
                  {(selectedItem.data.itinerary || []).map((day, idx) => {
                    const isCurrentEditing = isEditing && editingDay?.day === day.day;

                    return (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group"
                      >

                        <div className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isCurrentEditing ? 'ring-4 ring-blue-50 border-blue-500 shadow-2xl' : 'border-gray-100 shadow-sm hover:shadow-xl'}`}>
                          <div className="p-6 md:p-8">
                            {isCurrentEditing ? (
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">Editing Day {day.day}</span>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="font-bold text-gray-500" onClick={() => { setIsEditing(false); setEditingDay(null); setEditingActivitiesHtml("<p></p>"); }}>Cancel</Button>
                                    <Button size="sm" className="bg-blue-600 font-bold" onClick={handleSaveDay} disabled={isSaving}>
                                      {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <Input
                                    className="text-xl font-bold py-6 rounded-2xl border-gray-100 focus:border-gray-400 !bg-white"
                                    value={editingDay?.title || ""}
                                    placeholder="Day Title..."
                                    onChange={(e) => setEditingDay(p => p ? { ...p, title: e.target.value } : null)}
                                  />
                                  <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Activities</label>
                                    <RichTextEditor
                                      value={editingActivitiesHtml}
                                      onChange={setEditingActivitiesHtml}
                                      placeholder="Write detailed day activities..."
                                      className="!bg-white rounded-2xl border border-gray-100"
                                      contentType="itinerary"
                                      editorViewportClassName="min-h-[220px] max-h-[320px] overflow-y-auto custom-scrollbar"
                                    />
                                    <p className="text-xs text-gray-500">
                                      Tip: Use bullet list for cleaner itinerary points.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">Day {day.day}</span>
                                      <h3 className="!text-2xl !font-black !text-gray-900 group-hover:text-blue-600 transition-colors">{day.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="icon" className="rounded-xl border-gray-100" onClick={() => {
                                        setEditingDay({ ...day });
                                        setEditingActivitiesHtml(activitiesToHtml(day.activities || []));
                                        setIsEditing(true);
                                        setIsAddingDay(false);
                                      }}><Edit className="w-4 h-4 text-gray-600" /></Button>
                                      <Button variant="outline" size="icon" className="rounded-xl border-gray-100 hover:bg-red-50" onClick={() => handleDeleteDay(day.day)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                  </div>
                                    <div className="space-y-2">
                                    {(day.activities || []).length === 1 && containsHtml((day.activities || [])[0]) ? (
                                      <div
                                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 overflow-x-auto [&_h1]:!text-xl [&_h1]:!font-bold [&_h1]:!text-slate-900 [&_h1]:!mb-3 [&_h2]:!text-lg [&_h2]:!font-bold [&_h2]:!text-slate-900 [&_h2]:!mb-3 [&_h3]:!text-base [&_h3]:!font-semibold [&_h3]:!text-slate-900 [&_h3]:!mb-2 [&_p]:!text-sm [&_p]:!text-slate-700 [&_p]:!mb-3 [&_ul]:!list-disc [&_ul]:!pl-5 [&_ul]:!space-y-2 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_ol]:!space-y-2 [&_li]:!text-sm [&_li]:!text-slate-700 [&_a]:!text-blue-600 [&_a]:!underline [&_table]:!w-full [&_table]:!border [&_table]:!border-slate-200 [&_th]:!bg-slate-100 [&_th]:!px-3 [&_th]:!py-2 [&_th]:!text-left [&_th]:!text-sm [&_th]:!font-semibold [&_td]:!px-3 [&_td]:!py-2 [&_td]:!text-sm [&_td]:!text-slate-700 [&_td]:!border-t [&_td]:!border-slate-200"
                                        dangerouslySetInnerHTML={{ __html: (day.activities || [])[0] }}
                                      />
                                    ) : (
                                      (day.activities || []).map((act, i) => (
                                        <div key={i} className="flex gap-2 items-start py-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                                          <span className="text-sm text-gray-600 font-medium leading-relaxed">{act}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Inline Add Day Form */}
                  {isAddingDay ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
                      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">Adding Day {(selectedItem.data.itinerary || []).length + 1}</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="font-bold text-gray-400" onClick={() => setIsAddingDay(false)}>Discard</Button>
                            <Button size="sm" className="bg-blue-600 font-bold hover:bg-blue-700" onClick={handleAddDay} disabled={isSaving}>
                              {isSaving ? "Saving..." : "Add to Itinerary"}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <Input
                            className="!text-xl !font-semibold !py-4 rounded-2xl border-gray-100 focus:border-gray-400 !bg-white"
                            placeholder="Enter Day Theme/Title..."
                            value={newDay.title || ""}
                            onChange={(e) => setNewDay(p => ({ ...p, title: e.target.value }))}
                          />
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Activities</label>
                            <RichTextEditor
                              value={newDayActivitiesHtml}
                              onChange={setNewDayActivitiesHtml}
                              placeholder="Write detailed day activities..."
                              className="!bg-white rounded-2xl border border-gray-100"
                              contentType="itinerary"
                              editorViewportClassName="min-h-[220px] max-h-[320px] overflow-y-auto custom-scrollbar"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingDay(true);
                        setIsEditing(false);
                        setEditingDay(null);
                        setNewDayActivitiesHtml("<p></p>");
                        setNewDay({ day: (selectedItem.data.itinerary || []).length + 1, title: "", activities: [""] });
                      }}
                      className="w-full py-4 border-dashed border-2 border-gray-200 rounded-3xl hover:bg-gray-50 hover:border-blue-400 group transition-all"
                    >
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600 mr-2" />
                      <span className="!text-lg !font-bold text-gray-500 group-hover:text-blue-600">Add Complementary Day {(selectedItem.data.itinerary || []).length + 1}</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Custom Styles for Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AdminItinerary;
