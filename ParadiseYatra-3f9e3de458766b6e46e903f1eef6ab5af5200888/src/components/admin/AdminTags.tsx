"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "react-toastify";
import Image from "next/image";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Tag as TagIcon,
    Search,
    ChevronRight,
    Package,
    CheckCircle2,
    ListFilter,
    ImageIcon,
    Upload,
    ChevronDown,
    Layers,
    FolderPlus,
    Subtitles
} from "lucide-react";

interface Tag {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parent?: string | { _id: string, name: string, slug: string };
    image?: string;
    packages: string[]; // Array of package IDs
    createdAt: string;
}

interface PackageItem {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    category?: string;
    duration?: string;
    location?: string;
    image?: string;
    price?: number;
    country?: string;
    state?: string;
    tourType?: string;
}

const AdminTags = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [allPackages, setAllPackages] = useState<PackageItem[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [packageSearchTerm, setPackageSearchTerm] = useState("");

    // Robust helper to extract ID from any format
    const getPackageId = (item: any): string => {
        if (!item) return "";
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
            const id = item._id || item.id;
            if (id && typeof id === 'object' && id.$oid) return id.$oid;
            if (id) return String(id);
        }
        return "";
    };

    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTag, setActiveTag] = useState<Tag | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parent: "" as string,
        image: "" as string,
        packages: [] as string[]
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/tags");
            if (!response.ok) throw new Error("Failed to fetch tags");
            const result = await response.json();
            if (result.success) {
                setTags(result.data);
            } else {
                throw new Error(result.message || "Failed to fetch tags");
            }
        } catch (err) {
            toast.error("Failed to load tags");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllPackages = async () => {
        try {
            setPackagesLoading(true);
            const token = localStorage.getItem("adminToken");
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const response = await fetch('/api/all-packages?limit=500&isActive=true', { headers });
            const data = await response.json();

            const normalize = (data: any) => {
                if (!data) return [];
                if (Array.isArray(data)) return data;
                if (data.packages) return data.packages;
                return [];
            };

            setAllPackages(normalize(data));
        } catch (err) {
            console.error("Failed to fetch packages", err);
            toast.error("Failed to load packages");
        } finally {
            setPackagesLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
        fetchAllPackages();
    }, []);

    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', 'tags');

            const token = localStorage.getItem("adminToken");
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to upload image");
            return result.url;
        } catch (err) {
            console.error("Image upload failed", err);
            toast.error("Failed to upload image");
            return null;
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error("Tag name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            let finalImage = formData.image;

            if (imageFile) {
                const uploadedUrl = await handleImageUpload(imageFile);
                if (uploadedUrl) finalImage = uploadedUrl;
            }

            const token = localStorage.getItem("adminToken");
            const response = await fetch("/api/tags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, image: finalImage }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to create tag");

            toast.success("Tag created successfully!");
            setShowCreateForm(false);
            resetForm();
            fetchTags();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!activeTag || !formData.name.trim()) return;

        try {
            setIsSubmitting(true);
            let finalImage = formData.image;

            if (imageFile) {
                const uploadedUrl = await handleImageUpload(imageFile);
                if (uploadedUrl) finalImage = uploadedUrl;
            }

            const token = localStorage.getItem("adminToken");
            const response = await fetch(`/api/tags/${activeTag._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, image: finalImage }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to update tag");

            toast.success("Tag updated successfully!");
            setIsEditing(false);
            fetchTags();
            // Update local active tag
            setActiveTag({ ...activeTag, ...formData, image: finalImage });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`/api/tags/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to delete tag");

            toast.success("Tag deleted successfully");
            setDeleteId(null);
            if (activeTag?._id === deleteId) setActiveTag(null);
            fetchTags();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            parent: "",
            image: "",
            packages: []
        });
        setImageFile(null);
        setImagePreview("");
    };

    const handleTagSelect = (tag: Tag) => {
        setActiveTag(tag);
        // Ensure packages are normalized to string IDs for consistent tracking
        const normalizedPackages = (tag.packages || [])
            .map(p => getPackageId(p))
            .filter(id => id !== "");

        // Handle parent ID robustly
        let parentId = "";
        if (tag.parent) {
            parentId = typeof tag.parent === 'string' ? tag.parent : tag.parent._id;
        }

        setFormData({
            name: tag.name,
            description: tag.description || "",
            parent: parentId,
            image: tag.image || "",
            packages: normalizedPackages
        });
        setImagePreview(tag.image || "");
        setImageFile(null);
        setIsEditing(false);
        setShowCreateForm(false);
    };

    const togglePackage = (pkg: any) => {
        const itemId = getPackageId(pkg);
        if (!itemId) return;

        setFormData(prev => {
            const isSelected = prev.packages.includes(itemId);

            if (isSelected) {
                return {
                    ...prev,
                    packages: prev.packages.filter(id => id !== itemId)
                };
            } else {
                return { ...prev, packages: [...prev.packages, itemId] };
            }
        });
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPackages = allPackages.filter(pkg => {
        const searchLower = packageSearchTerm.toLowerCase();
        const name = (pkg.title || pkg.name || "").toLowerCase();
        const location = (pkg.location || "").toLowerCase();
        const country = (pkg.country || "").toLowerCase();
        const state = (pkg.state || "").toLowerCase();

        return name.includes(searchLower) ||
            location.includes(searchLower) ||
            country.includes(searchLower) ||
            state.includes(searchLower);
    });

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 rounded-xl overflow-hidden shadow-inner">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Tag List */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Tags</h2>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setShowCreateForm(true);
                                    setActiveTag(null);
                                    resetForm();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2 h-8"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                New
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 CustomScrollbar">
                        {loading && tags.length === 0 ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <TagIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No tags found</p>
                            </div>
                        ) : (
                            tags
                                .filter(tag => !tag.parent) // Only root level tags in main list logic or grouped
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((parentTag) => (
                                    <React.Fragment key={parentTag._id}>
                                        <button
                                            onClick={() => handleTagSelect(parentTag)}
                                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${activeTag?._id === parentTag._id
                                                ? "bg-blue-50 text-blue-700 shadow-sm border-blue-100"
                                                : "hover:bg-gray-50 text-gray-700"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${activeTag?._id === parentTag._id ? "bg-white" : "bg-blue-50"
                                                        }`}>
                                                        <TagIcon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="!font-semibold !text-base truncate w-32">{parentTag.name}</h3>
                                                        <p className="text-[10px] !text-slate-500">/{parentTag.slug}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${activeTag?._id === parentTag._id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                                                    }`} />
                                            </div>
                                        </button>

                                        {/* Sub-tags */}
                                        {tags
                                            .filter(t => (typeof t.parent === 'string' ? t.parent : t.parent?._id) === parentTag._id)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(subTag => (
                                                <button
                                                    key={subTag._id}
                                                    onClick={() => handleTagSelect(subTag)}
                                                    className={`w-[90%] float-right text-left p-2.5 rounded-xl border-l-2 mb-1 transition-all duration-200 group ${activeTag?._id === subTag._id
                                                        ? "bg-blue-50/50 text-blue-700 border-blue-400"
                                                        : "hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Subtitles className="w-3.5 h-3.5 text-blue-500" />
                                                        <div>
                                                            <h4 className="!font-medium !text-sm truncate w-28">{subTag.name}</h4>
                                                            <p className="text-[9px] !text-slate-400">/{subTag.slug}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                        <div className="clear-both" />
                                    </React.Fragment>
                                ))
                        )}
                    </div>
                </div>

                {/* Right Content - Tag Details & Package Linking */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-8 CustomScrollbar">
                    <AnimatePresence mode="wait">
                        {showCreateForm || (activeTag && isEditing) ? (
                            <motion.div
                                key="edit-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-6xl mx-auto space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {showCreateForm ? "Create New Tag" : `Edit Tag: ${activeTag?.name}`}
                                    </h2>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setIsEditing(false);
                                            }}
                                            className="rounded-xl text-slate-900"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={showCreateForm ? handleCreate : handleUpdate}
                                            disabled={isSubmitting}
                                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 min-w-[120px]"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </div>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Tag
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b border-gray-100">
                                        <CardTitle className="text-lg font-semibold flex items-center">
                                            <ListFilter className="w-5 h-5 mr-2 text-blue-600" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Tag Name <span className="text-red-500">*</span></label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., Honeymoon, Adventure, Luxury"
                                                    className="bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl py-6"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Description</label>
                                                <Textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="What packages should have this tag?"
                                                    rows={4}
                                                    className="bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                                                />
                                            </div>
                                        </div>


                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                                    <CardHeader className="bg-white border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="!text-lg !font-semibold flex items-center">
                                                <Package className="w-5 h-5 mr-2 text-blue-600" />
                                                Link Packages
                                            </CardTitle>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                {formData.packages.length} selected
                                            </Badge>
                                        </div>
                                        <div className="mt-4 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                placeholder="Search packages by name, location, country, or state..."
                                                value={packageSearchTerm}
                                                onChange={(e) => setPackageSearchTerm(e.target.value)}
                                                className="pl-9 bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 rounded-xl"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="max-h-[600px] overflow-y-auto CustomScrollbar">
                                            {packagesLoading ? (
                                                <div className="flex justify-center p-12">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : filteredPackages.length === 0 ? (
                                                <div className="text-center py-12 text-gray-500">
                                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p>No packages found</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {filteredPackages.map((pkg) => {
                                                        const pkgId = getPackageId(pkg);
                                                        if (!pkgId) return null;
                                                        const isSelected = formData.packages.includes(pkgId);
                                                        return (
                                                            <button
                                                                key={pkgId}
                                                                onClick={() => togglePackage(pkg)}
                                                                className={`flex flex-col text-left rounded-xl border transition-all overflow-hidden ${isSelected
                                                                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                                                    : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-md"
                                                                    }`}
                                                            >
                                                                {/* Package Image */}
                                                                <div className="relative h-32 w-full bg-gray-100">
                                                                    {pkg.image ? (
                                                                        <Image
                                                                            src={pkg.image}
                                                                            alt={pkg.title || pkg.name || "Package"}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex items-center justify-center h-full">
                                                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                                                        </div>
                                                                    )}
                                                                    {/* Selection Indicator */}
                                                                    <div className={`absolute top-2 right-2 p-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-white/80"}`}>
                                                                        <CheckCircle2 className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-400"}`} />
                                                                    </div>
                                                                </div>

                                                                {/* Package Info */}
                                                                <div className="p-3 flex-1">
                                                                    <h4 className={`font-semibold text-sm line-clamp-2 mb-1 ${isSelected ? "!text-blue-900" : "!text-gray-800"}`}>
                                                                        {pkg.title || pkg.name}
                                                                    </h4>
                                                                    <div className="space-y-1">
                                                                        {(pkg.location || pkg.country || pkg.state) && (
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                📍 {pkg.location || pkg.country || pkg.state}
                                                                            </p>
                                                                        )}
                                                                        {pkg.duration && (
                                                                            <p className="text-xs text-gray-500">
                                                                                ⏱️ {pkg.duration}
                                                                            </p>
                                                                        )}
                                                                        {pkg.price && (
                                                                            <p className="text-xs font-semibold text-blue-600">
                                                                                ₹{pkg.price.toLocaleString()}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : activeTag ? (
                            <motion.div
                                key="tag-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-6xl mx-auto space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                                            <TagIcon className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h2 className="!text-xl !font-bold text-gray-900">{activeTag.name}</h2>
                                                {activeTag.parent ? (
                                                    <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-xs font-bold ring-1 ring-blue-100">
                                                        <Layers className="w-3 h-3 mr-1" />
                                                        {typeof activeTag.parent === 'object' ? activeTag.parent.name : "Sub-tag"}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs font-bold ring-1 ring-emerald-100">
                                                        Root Tag
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-500 font-medium">/{activeTag.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        {!activeTag.parent && (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    resetForm();
                                                    setFormData(prev => ({ ...prev, parent: activeTag._id }));
                                                    setShowCreateForm(true);
                                                }}
                                                className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            >
                                                <FolderPlus className="w-4 h-4 mr-2" />
                                                Add Sub-tag
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            className="rounded-xl bg-white text-slate-900 border-blue-200 hover:border-blue-400"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Tag
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setDeleteId(activeTag._id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {activeTag.image && (
                                    <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
                                        <Image
                                            src={activeTag.image}
                                            alt={activeTag.name}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                            <div className="flex items-center space-x-2 text-white/90 text-sm font-medium mb-1">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>Tag Banner / Card Image</span>
                                            </div>
                                            <h3 className="text-white text-2xl font-bold">{activeTag.name} Banner</h3>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="md:col-span-2 border-none shadow-sm rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="!text-lg !font-bold">Description</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="!text-gray-600 leading-relaxed">
                                                {activeTag.description || "No description provided."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="!text-lg !font-bold">Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Packages</span>
                                                <Badge className="bg-blue-600 font-bold">{activeTag.packages?.length || 0}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Created</span>
                                                <span className="text-sm font-medium">{new Date(activeTag.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="!text-xl !font-bold text-gray-900 flex items-center">
                                        <Package className="w-6 h-6 mr-2 text-blue-600" />
                                        Linked Packages ({activeTag.packages?.length || 0})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {activeTag.packages && activeTag.packages.length > 0 ? (
                                            activeTag.packages.map((item: any, index: number) => {
                                                const pkgId = getPackageId(item);
                                                const uniqueKey = pkgId ? `${pkgId}-${index}` : `pkg-${index}`;

                                                // Find package info
                                                let pkgInfo = typeof item === 'object' && (item.title || item.name) ? { ...item } : null;

                                                if (!pkgInfo && pkgId) {
                                                    const found = allPackages.find(p => getPackageId(p) === pkgId);
                                                    if (found) {
                                                        pkgInfo = { ...found };
                                                    }
                                                }

                                                return (
                                                    <div key={uniqueKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
                                                        {/* Package Image */}
                                                        <div className="relative h-32 w-full bg-gray-100">
                                                            {pkgInfo?.image ? (
                                                                <Image
                                                                    src={pkgInfo.image}
                                                                    alt={pkgInfo?.title || pkgInfo?.name || "Package"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-3">
                                                            <p className="!font-semibold !text-sm !text-gray-900 line-clamp-2 mb-1">
                                                                {pkgInfo?.title || pkgInfo?.name || "Unknown Package"}
                                                            </p>
                                                            <p className="!text-xs !text-gray-500 truncate">
                                                                {pkgInfo?.location || pkgInfo?.country || pkgInfo?.state || "Loading..."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full py-12 text-center bg-gray-100 rounded-3xl border-2 border-dashed border-gray-200">
                                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No packages linked to this tag yet.</p>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsEditing(true)}
                                                    className="!text-blue-600 font-bold hover:bg-transparent"
                                                >
                                                    Link Packages Now
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="p-8 bg-blue-50 rounded-full">
                                    <TagIcon className="w-16 h-16 text-blue-200" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Select a Tag</h2>
                                    <p className="text-gray-500">Choose a tag from the sidebar to view details and link packages.</p>
                                </div>
                                <Button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Tag
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Tag"
                message={`Are you sure you want to delete the tag "${activeTag?.name}"? This action cannot be undone and will remove this tag from all linked packages.`}
            />

            <style jsx global>{`
                .CustomScrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .CustomScrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .CustomScrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .CustomScrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default AdminTags;
