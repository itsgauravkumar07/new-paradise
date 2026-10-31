"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Star, Clock, Edit, Trash2, Plus, Eye, Loader2, Upload, Image as ImageIcon, IndianRupee, Tag, X, Download } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface Package {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    image: string;
    imageAlt?: string;
    location: string;
    country: string;
    state?: string;
    tourType: string;
    priceType?: "per_person" | "per_couple";
    price: number;
    originalPrice?: number;
    discount?: number;
    duration: string;
    isActive: boolean;
    tags: string[];
    destinationsCovered?: string[];
    createdAt: string;
    updatedAt: string;
}

const AdminPackages = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);
    const [previewPackage, setPreviewPackage] = useState<Package | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [allDestinationCovers, setAllDestinationCovers] = useState<any[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [exportingAll, setExportingAll] = useState(false);
    const [exportingFiltered, setExportingFiltered] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTagStatus, setFilterTagStatus] = useState<"all" | "with-tags" | "without-tags" | string>("all");
    const [filterCountry, setFilterCountry] = useState<string>("all");
    const [filterState, setFilterState] = useState<string>("all");
    const [filterTourType, setFilterTourType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Country and state management
    const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
    const [states, setStates] = useState<Array<{ name: string; state_code: string }>>([]);
    const [selectedState, setSelectedState] = useState<string>("");

    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

    // Track if slug has been manually edited
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    // Destinations Covered
    const [newDestinationCovered, setNewDestinationCovered] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        shortDescription: "",
        imageAlt: "",
        location: "",
        country: "",
        state: "",
        tourType: "india",
        priceType: "per_person" as "per_person" | "per_couple",
        price: "",
        originalPrice: "",
        discount: "",
        duration: "",
        isActive: true,
        tags: [] as string[],
        destinationsCovered: [] as string[]
    });

    // Get all countries
    const countries = React.useMemo(() => {
        return Country.getAllCountries().map((c: ICountry) => ({
            iso2: c.isoCode,
            name: c.name,
        }));
    }, []);

    const countryOptions = countries.map(country => ({
        value: country.iso2,
        label: country.name
    }));

    // Handle country change
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryIso2 = e.target.value;
        setSelectedCountryIso2(countryIso2);
        setSelectedState("");

        const selectedCountry = countries.find(c => c.iso2 === countryIso2);
        setFormData(prev => ({
            ...prev,
            country: selectedCountry ? selectedCountry.name : "",
            state: ""
        }));

        if (countryIso2) {
            const countryStates = State.getStatesOfCountry(countryIso2);
            setStates(countryStates.map((s: IState) => ({
                name: s.name,
                state_code: s.isoCode || '',
            })));
        } else {
            setStates([]);
        }
    };

    // Helper function to generate slug from text
    const generateSlugFromText = (text: string): string => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
    };

    const getPriceTypeLabel = (priceType?: string) =>
        priceType === "per_couple" ? "Per Couple" : "Per Person";

    const buildLocalExportTimestamp = () => {
        const now = new Date();
        const pad = (value: number) => String(value).padStart(2, "0");
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    };

    const downloadExportFile = (blob: Blob, fileName: string) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
    };

    const exportPackagesToExcel = async (
        scope: "all" | "ids",
        options?: { packageIds?: string[]; fileNamePrefix?: string; successMessage?: string }
    ) => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            toast.error("Authentication required. Please login again.");
            return false;
        }

        const payload: { scope: "all" | "ids"; packageIds?: string[] } = { scope };
        if (scope === "ids") {
            payload.packageIds = options?.packageIds || [];
        }

        const response = await fetch("/api/all-packages/export", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to export packages");
        }

        const blob = await response.blob();
        const fileNamePrefix = options?.fileNamePrefix || "packages-export";
        const fileName = `${fileNamePrefix}-${buildLocalExportTimestamp()}.xlsx`;
        downloadExportFile(blob, fileName);

        if (options?.successMessage) {
            toast.success(options.successMessage);
        }

        return true;
    };

    const handleExportAll = async () => {
        if (exportingAll || exportingFiltered) return;

        try {
            setExportingAll(true);
            await exportPackagesToExcel("all", {
                fileNamePrefix: "packages-all",
                successMessage: "All packages exported successfully!",
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to export all packages";
            console.error("Export all packages error:", err);
            toast.error(errorMessage);
        } finally {
            setExportingAll(false);
        }
    };

    const handleExportFiltered = async () => {
        if (exportingFiltered || exportingAll) return;

        if (filteredPackages.length === 0) {
            toast.error("No packages available for filtered export.");
            return;
        }

        try {
            setExportingFiltered(true);
            await exportPackagesToExcel("ids", {
                packageIds: filteredPackages.map((pkg) => pkg._id),
                fileNamePrefix: `packages-filtered-${filteredPackages.length}`,
                successMessage: `${filteredPackages.length} filtered packages exported successfully!`,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to export filtered packages";
            console.error("Export filtered packages error:", err);
            toast.error(errorMessage);
        } finally {
            setExportingFiltered(false);
        }
    };

    // Handle title change with auto-slug generation
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setFormData(prev => {
            const updates: any = { ...prev, name: newTitle };

            // Auto-generate slug only if it hasn't been manually edited
            if (!isSlugManuallyEdited) {
                updates.slug = generateSlugFromText(newTitle);
            }

            return updates;
        });
    };

    // Handle slug change
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value;
        setFormData(prev => ({ ...prev, slug: newSlug }));

        // Mark as manually edited if user types anything
        if (!isSlugManuallyEdited) {
            setIsSlugManuallyEdited(true);
        }
    };

    // Image handling functions
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 220 * 1024) {
            toast.error('Image size must be 220KB or less');
            return;
        }

        setImageFile(file);
        setImageUrl("");

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setImageFile(null);

        if (url) {
            setImagePreview(url);
        } else {
            setImagePreview("");
        }
    };

    const clearImageSelection = () => {
        setImageFile(null);
        setImageUrl("");
        setImagePreview("");
    };

    const fetchPackages = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken');
            const headers: HeadersInit = {};

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/all-packages?limit=100', {
                headers,
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch packages');
            }

            const data = await response.json();

            let packagesArray: Package[] = [];

            if (Array.isArray(data)) {
                packagesArray = data;
            } else if (data.packages && Array.isArray(data.packages)) {
                packagesArray = data.packages;
            } else {
                packagesArray = [];
            }

            setPackages(packagesArray);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching packages';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAllTags(result.data);
                }
            }
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    };

    const fetchDestinationCovers = async () => {
        try {
            const response = await fetch('/api/destination-covers');
            if (response.ok) {
                const result = await response.json();
                setAllDestinationCovers(result || []);
            }
        } catch (err) {
            console.error('Failed to fetch destination covers:', err);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchTags();
        fetchDestinationCovers();
    }, []);

    // Sync tags with package - bidirectional relationship
    const syncTagsWithPackage = async (packageId: string, newTagIds: string[], oldTagIds: string[] = []) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;

            // Find tags to add (in new but not in old)
            const tagsToAdd = newTagIds.filter(id => !oldTagIds.includes(id));

            // Find tags to remove (in old but not in new)
            const tagsToRemove = oldTagIds.filter(id => !newTagIds.includes(id));

            // Update each tag that needs to add this package
            for (const tagId of tagsToAdd) {
                const tag = allTags.find(t => t._id === tagId);
                if (!tag) continue;

                const updatedPackages = [...(tag.packages || []), packageId];

                await fetch(`/api/tags/${tagId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: tag.name,
                        description: tag.description,
                        packages: updatedPackages
                    }),
                });
            }

            // Update each tag that needs to remove this package
            for (const tagId of tagsToRemove) {
                const tag = allTags.find(t => t._id === tagId);
                if (!tag) continue;

                const updatedPackages = (tag.packages || []).filter((id: string) => id !== packageId);

                await fetch(`/api/tags/${tagId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: tag.name,
                        description: tag.description,
                        packages: updatedPackages
                    }),
                });
            }

            // Refresh tags to show updated counts
            await fetchTags();
        } catch (err) {
            console.error('Failed to sync tags:', err);
            // Don't show error to user as this is a background sync
        }
    };

    const handleCreatePackage = async () => {
        try {
            // Validation
            if (!formData.name?.trim()) {
                toast.error('Title is required');
                return;
            }
            if (!formData.slug?.trim()) {
                // Assume slug is optional or generated on backend if empty, 
                // but user asked for slug input, so let's validate or let backend handle
                // Backend generates slug if not unique but base slug comes from name.
                // Let's enforce slug required or auto-generatable.
            }
            if (!formData.description?.trim()) {
                toast.error('Description is required');
                return;
            }
            if (!formData.shortDescription?.trim()) {
                toast.error('Short description is required');
                return;
            }
            if (!formData.location?.trim()) {
                toast.error('Destination is required');
                return;
            }
            if (!formData.country?.trim()) {
                toast.error('Country is required');
                return;
            }
            if (!formData.tourType) {
                toast.error('Tour type is required');
                return;
            }
            if (!formData.price) {
                toast.error('Price is required');
                return;
            }
            if (!formData.duration?.trim()) {
                toast.error('Duration is required');
                return;
            }
            if (!imagePreview && !imageFile) {
                toast.error('Please select an image');
                return;
            }

            setSubmitting(true);

            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication required. Please login again.');
                setSubmitting(false);
                return;
            }

            // If using URL method
            if (uploadMethod === 'url') {
                if (!imageUrl) {
                    toast.error('Please provide an image URL');
                    setSubmitting(false);
                    return;
                }

                const packageData = {
                    name: formData.name.trim(),
                    slug: formData.slug.trim(),
                    description: formData.description.trim(),
                    shortDescription: formData.shortDescription.trim(),
                    image: imageUrl,
                    imageAlt: formData.imageAlt.trim(),
                    location: formData.location.trim(),
                    country: formData.country.trim(),
                    state: formData.state?.trim() || '',
                    tourType: formData.tourType,
                    priceType: formData.priceType,
                    price: parseFloat(formData.price),
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                    discount: formData.discount ? parseFloat(formData.discount) : undefined,
                    duration: formData.duration.trim(),
                    isActive: formData.isActive,
                    tags: formData.tags
                };

                const response = await fetch('/api/all-packages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(packageData),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to create package');
                }
                const newPackage = result.package || result;

                // Sync tags bidirectionally
                if (formData.tags.length > 0 && newPackage._id) {
                    await syncTagsWithPackage(newPackage._id, formData.tags);
                }

                setPackages(prev => [newPackage, ...prev]);
                setCurrentPage(1);
                resetForm();
                toast.success('Package created successfully!');
                return;
            }

            // If using file upload
            if (uploadMethod === 'file') {
                if (!imageFile) {
                    toast.error('Please select an image file');
                    setSubmitting(false);
                    return;
                }

                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);
                uploadFormData.append('name', formData.name.trim());
                if (formData.slug.trim()) uploadFormData.append('slug', formData.slug.trim());
                uploadFormData.append('description', formData.description.trim());
                uploadFormData.append('shortDescription', formData.shortDescription.trim());
                uploadFormData.append('imageAlt', formData.imageAlt.trim());
                uploadFormData.append('location', formData.location.trim());
                uploadFormData.append('country', formData.country.trim());
                if (formData.state?.trim()) uploadFormData.append('state', formData.state.trim());
                uploadFormData.append('tourType', formData.tourType);
                uploadFormData.append('priceType', formData.priceType);
                uploadFormData.append('price', formData.price);
                if (formData.originalPrice) uploadFormData.append('originalPrice', formData.originalPrice);
                if (formData.discount) uploadFormData.append('discount', formData.discount);
                uploadFormData.append('duration', formData.duration.trim());
                uploadFormData.append('isActive', String(formData.isActive));
                uploadFormData.append('tags', JSON.stringify(formData.tags));

                const response = await fetch('/api/all-packages', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: uploadFormData,
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to create package');
                }
                const newPackage = result.package || result;

                // Sync tags bidirectionally
                if (formData.tags.length > 0 && newPackage._id) {
                    await syncTagsWithPackage(newPackage._id, formData.tags);
                }

                setPackages(prev => [newPackage, ...prev]);
                setCurrentPage(1);
                resetForm();
                toast.success('Package created successfully!');
            } else {
                toast.error('Please select an image');
                setSubmitting(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create package';
            console.error('Create package error:', err);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePackage = async () => {
        if (!editingPackage) return;

        try {
            // Validation (same as create)
            if (!formData.name?.trim()) {
                toast.error('Title is required');
                return;
            }

            setSubmitting(true);

            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication required. Please login again.');
                setSubmitting(false);
                return;
            }

            // If using URL method
            if (uploadMethod === 'url') {
                const packageData = {
                    name: formData.name.trim(),
                    slug: formData.slug.trim(),
                    description: formData.description.trim(),
                    shortDescription: formData.shortDescription.trim(),
                    image: imageUrl,
                    imageAlt: formData.imageAlt.trim(),
                    location: formData.location.trim(),
                    country: formData.country.trim(),
                    state: formData.state?.trim() || '',
                    tourType: formData.tourType,
                    priceType: formData.priceType,
                    price: parseFloat(formData.price),
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                    discount: formData.discount ? parseFloat(formData.discount) : undefined,
                    duration: formData.duration.trim(),
                    isActive: formData.isActive,
                    tags: formData.tags
                };

                const response = await fetch(`/api/all-packages/${editingPackage._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(packageData),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to update package');
                }
                const updatedPackage = result.package || result;

                // Sync tags bidirectionally (compare old and new tags)
                await syncTagsWithPackage(editingPackage._id, formData.tags, editingPackage.tags || []);

                setPackages(prev => prev.map(p => p._id === updatedPackage._id ? updatedPackage : p));
                setEditingPackage(null);
                resetForm();
                toast.success('Package updated successfully!');
                return;
            }

            // If using file upload
            const uploadFormData = new FormData();

            if (imageFile) {
                uploadFormData.append('image', imageFile);
            }

            uploadFormData.append('name', formData.name.trim());
            if (formData.slug.trim()) uploadFormData.append('slug', formData.slug.trim());
            uploadFormData.append('description', formData.description.trim());
            uploadFormData.append('shortDescription', formData.shortDescription.trim());
            uploadFormData.append('imageAlt', formData.imageAlt.trim());
            uploadFormData.append('location', formData.location.trim());
            uploadFormData.append('country', formData.country.trim());
            if (formData.state?.trim()) uploadFormData.append('state', formData.state.trim());
            uploadFormData.append('tourType', formData.tourType);
            uploadFormData.append('priceType', formData.priceType);
            uploadFormData.append('price', formData.price);
            if (formData.originalPrice) uploadFormData.append('originalPrice', formData.originalPrice);
            if (formData.discount) uploadFormData.append('discount', formData.discount);
            uploadFormData.append('duration', formData.duration.trim());
            uploadFormData.append('isActive', String(formData.isActive));
            uploadFormData.append('tags', JSON.stringify(formData.tags));

            const response = await fetch(`/api/all-packages/${editingPackage._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: uploadFormData,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update package');
            }
            const updatedPackage = result.package || result;

            // Sync tags bidirectionally (compare old and new tags)
            await syncTagsWithPackage(editingPackage._id, formData.tags, editingPackage.tags || []);

            setPackages(prev => prev.map(p => p._id === updatedPackage._id ? updatedPackage : p));
            setEditingPackage(null);
            resetForm();
            toast.success('Package updated successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update package';
            console.error('Update package error:', err);
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditPackage = (pkg: Package) => {
        setEditingPackage(pkg);

        const country = countries.find(c => c.name === pkg.country);
        setSelectedCountryIso2(country?.iso2 || '');
        setSelectedState(pkg.state || '');

        if (country?.iso2) {
            const countryStates = State.getStatesOfCountry(country.iso2);
            setStates(countryStates.map((s: IState) => ({
                name: s.name,
                state_code: s.isoCode || '',
            })));
        }

        // Set existing image
        const existingImage = pkg.image || '';
        setImagePreview(existingImage);
        setImageUrl(existingImage);
        setUploadMethod('url');
        setImageFile(null);

        // Merge tags from the package and tags that link to this package from Tag Management
        const linkedTags = allTags
            .filter(tag => tag.packages && tag.packages.includes(pkg._id))
            .map(tag => tag._id);
        const mergedTags = Array.from(new Set([...(pkg.tags || []), ...linkedTags]));

        setFormData({
            name: pkg.name || "",
            slug: pkg.slug || "",
            description: pkg.description || "",
            shortDescription: pkg.shortDescription || "",
            imageAlt: pkg.imageAlt || "",
            location: pkg.location || "",
            country: pkg.country || "",
            state: pkg.state || "",
            tourType: pkg.tourType || "india",
            priceType: pkg.priceType || "per_person",
            price: pkg.price?.toString() || "",
            originalPrice: pkg.originalPrice?.toString() || "",
            discount: pkg.discount?.toString() || "",
            duration: pkg.duration || "",
            isActive: pkg.isActive ?? true,
            tags: pkg.tags || [],
            destinationsCovered: pkg.destinationsCovered || []
        });
        setShowAddForm(true);
        setIsSlugManuallyEdited(true); // Mark as manually edited when editing existing package
    };

    const handleDeletePackage = async (id: string) => {
        try {
            setDeletingId(id);

            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication required. Please login again.');
                return;
            }

            const response = await fetch(`/api/all-packages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete package');
            }

            // Find the package to get its tags before deleting
            const packageToDelete = packages.find(p => p._id === id);

            // Remove this package from all tags
            if (packageToDelete && packageToDelete.tags && packageToDelete.tags.length > 0) {
                await syncTagsWithPackage(id, [], packageToDelete.tags);
            }

            setPackages(prev => {
                const updatedPackages = prev.filter(p => p._id !== id);
                const newTotalPages = Math.ceil(updatedPackages.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
                return updatedPackages;
            });
            toast.success('Package deleted successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete package';
            console.error('Delete package error:', err);
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const togglePackageStatus = async (pkg: Package) => {
        try {
            setSubmitting(true);

            const token = localStorage.getItem('adminToken');
            if (!token) {
                toast.error('Authentication required. Please login again.');
                return;
            }

            const response = await fetch(`/api/all-packages/${pkg._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    isActive: !pkg.isActive
                }),
            });

            if (!response.ok) {
                throw new Error('Status update failed');
            }

            setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, isActive: !pkg.isActive } : p));
            toast.success('Status updated successfully!');
        } catch (err) {
            console.error('Toggle status error:', err);
            toast.error('Failed to update package status');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            description: "",
            shortDescription: "",
            imageAlt: "",
            location: "",
            country: "",
            state: "",
            tourType: "india",
            priceType: "per_person",
            price: "",
            originalPrice: "",
            discount: "",
            duration: "",
            isActive: true,
            tags: [],
            destinationsCovered: []
        });
        clearImageSelection();
        setShowAddForm(false);
        setEditingPackage(null);
        setSelectedCountryIso2("");
        setStates([]);
        setSelectedState("");
        setIsSlugManuallyEdited(false);
    };

    // Get unique values for filters
    const uniqueCountries = React.useMemo(() => {
        const countries = [...new Set(packages.map(p => p.country).filter(Boolean))];
        return countries.sort();
    }, [packages]);

    const uniqueStates = React.useMemo(() => {
        const states = [...new Set(packages.map(p => p.state).filter(Boolean))];
        return states.sort();
    }, [packages]);

    // Filter packages based on all filter criteria
    const filteredPackages = React.useMemo(() => {
        return packages.filter(pkg => {
            // Search filter
            if (searchTerm) {
                const search = searchTerm.toLowerCase();
                const matchesSearch =
                    pkg.name.toLowerCase().includes(search) ||
                    pkg.location?.toLowerCase().includes(search) ||
                    pkg.country?.toLowerCase().includes(search) ||
                    pkg.state?.toLowerCase().includes(search) ||
                    pkg.description?.toLowerCase().includes(search);
                if (!matchesSearch) return false;
            }

            // Tag filter - check BOTH directions for bidirectional sync
            if (filterTagStatus !== "all") {
                if (filterTagStatus === "with-tags") {
                    // Check if package has any tags OR if any tag references this package
                    const hasTagsInPackage = pkg.tags && pkg.tags.length > 0;
                    const isReferencedByAnyTag = allTags.some(tag =>
                        tag.packages && tag.packages.includes(pkg._id)
                    );
                    if (!hasTagsInPackage && !isReferencedByAnyTag) return false;
                } else if (filterTagStatus === "without-tags") {
                    // Check if package has no tags AND no tag references this package
                    const hasTagsInPackage = pkg.tags && pkg.tags.length > 0;
                    const isReferencedByAnyTag = allTags.some(tag =>
                        tag.packages && tag.packages.includes(pkg._id)
                    );
                    if (hasTagsInPackage || isReferencedByAnyTag) return false;
                } else {
                    // Specific tag selected - check BOTH directions
                    const packageHasTag = pkg.tags && pkg.tags.includes(filterTagStatus);
                    const selectedTag = allTags.find(t => t._id === filterTagStatus);
                    const tagHasPackage = selectedTag && selectedTag.packages && selectedTag.packages.includes(pkg._id);

                    if (!packageHasTag && !tagHasPackage) return false;
                }
            }

            // Country filter
            if (filterCountry !== "all" && pkg.country !== filterCountry) {
                return false;
            }

            // State filter
            if (filterState !== "all" && pkg.state !== filterState) {
                return false;
            }

            // Tour type filter
            if (filterTourType !== "all" && pkg.tourType !== filterTourType) {
                return false;
            }

            // Status filter
            if (filterStatus !== "all") {
                if (filterStatus === "active" && !pkg.isActive) return false;
                if (filterStatus === "inactive" && pkg.isActive) return false;
            }

            return true;
        });
    }, [packages, searchTerm, filterTagStatus, filterCountry, filterState, filterTourType, filterStatus]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPackages = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Packages Portfolio</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and curate your amazing travel destinations.</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={handleExportAll}
                        disabled={exportingAll || exportingFiltered || loading}
                        className="bg-white/80 backdrop-blur-md text-emerald-700 font-bold px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingAll ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-emerald-500" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Export All
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleExportFiltered}
                        disabled={
                            exportingFiltered ||
                            exportingAll ||
                            loading ||
                            filteredPackages.length === 0
                        }
                        className="bg-white/80 backdrop-blur-md text-slate-700 font-bold px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {exportingFiltered ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-slate-500" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Export Filtered
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddForm(!showAddForm);
                        }}
                        className={`text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:scale-105 ${
                            showAddForm 
                                ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/25" 
                                : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25"
                        }`}
                    >
                        {showAddForm ? (
                            <>
                                <X size={20} /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={20} /> Add New Package
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {!showAddForm && (
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/40">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            Filters & Search
                        </h3>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterTagStatus("all");
                                setFilterCountry("all");
                                setFilterState("all");
                                setFilterTourType("all");
                                setFilterStatus("all");
                                setCurrentPage(1);
                            }}
                            className="text-[13px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                        >
                            <X size={14} strokeWidth={3} />
                            Clear All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                        {/* Search */}
                        <div className="xl:col-span-2 relative group">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Search</label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search by name, location..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</label>
                            <select
                                value={filterTagStatus}
                                onChange={(e) => {
                                    setFilterTagStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Packages</option>
                                <option value="with-tags">With Tags</option>
                                <option value="without-tags">Without Tags</option>
                                {allTags.map((tag) => (
                                    <option key={tag._id} value={tag._id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Country Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                            <select
                                value={filterCountry}
                                onChange={(e) => {
                                    setFilterCountry(e.target.value);
                                    setFilterState("all");
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Countries</option>
                                {uniqueCountries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                            <select
                                value={filterState}
                                onChange={(e) => {
                                    setFilterState(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer appearance-none disabled:opacity-50 disabled:bg-slate-50"
                                disabled={uniqueStates.length === 0}
                            >
                                <option value="all">All States</option>
                                {uniqueStates.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tour Type Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tour Type</label>
                            <select
                                value={filterTourType}
                                onChange={(e) => {
                                    setFilterTourType(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="india">India</option>
                                <option value="international">International</option>
                            </select>
                        </div>
                        {/* Status Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[13px] text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            Showing <span className="font-extrabold text-indigo-600">{filteredPackages.length}</span> of <span className="font-extrabold text-slate-700">{packages.length}</span> packages
                        </p>
                        {(searchTerm || filterTagStatus !== "all" || filterCountry !== "all" || filterState !== "all" || filterTourType !== "all" || filterStatus !== "all") && (
                            <div className="flex flex-wrap gap-2">
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        Search: "{searchTerm}"
                                        <button onClick={() => setSearchTerm("")} className="hover:text-indigo-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                                {filterTagStatus !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        Tag: {filterTagStatus === "with-tags" ? "With Tags" : filterTagStatus === "without-tags" ? "Without Tags" : allTags.find(t => t._id === filterTagStatus)?.name}
                                        <button onClick={() => setFilterTagStatus("all")} className="hover:text-purple-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                                {filterCountry !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        Country: {filterCountry}
                                        <button onClick={() => setFilterCountry("all")} className="hover:text-emerald-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                                {filterState !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        State: {filterState}
                                        <button onClick={() => setFilterState("all")} className="hover:text-yellow-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                                {filterTourType !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        Type: {filterTourType}
                                        <button onClick={() => setFilterTourType("all")} className="hover:text-orange-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                                {filterStatus !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                                        Status: {filterStatus}
                                        <button onClick={() => setFilterStatus("all")} className="hover:text-red-900 ml-1">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-indigo-100 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <h2 className="text-2xl font-extrabold mb-8 text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            {editingPackage ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> : <Plus size={20} />}
                        </div>
                        {editingPackage ? 'Edit Package Details' : 'Create New Package'}
                    </h2>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
                        {/* Left Column */}
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Package Title</label>
                                <input
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={handleTitleChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="e.g. Majestic Shimla Tour"
                                />
                            </div>



                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    {isSlugManuallyEdited && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsSlugManuallyEdited(false);
                                                setFormData(prev => ({ ...prev, slug: generateSlugFromText(prev.name) }));
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Reset to auto-generate
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={formData.slug || ""}
                                    onChange={handleSlugChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. majestic-shimla-tour"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {isSlugManuallyEdited
                                        ? '✏️ Custom slug (click "Reset to auto-generate" to sync with title)'
                                        : '🔄 Auto-generating from title'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                                <RichTextEditor
                                    value={formData.shortDescription || ""}
                                    onChange={(value) => setFormData({ ...formData, shortDescription: value })}
                                    contentType="packages"
                                    className="min-h-[170px]"
                                    editorViewportClassName="max-h-[260px]"
                                    placeholder="Brief summary for cards..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.price || ""}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                                    <select
                                        value={formData.priceType}
                                        onChange={(e) => setFormData({ ...formData, priceType: e.target.value as "per_person" | "per_couple" })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="per_person">Per Person</option>
                                        <option value="per_couple">Per Couple</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Optional)</label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.originalPrice || ""}
                                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                                    <div className="relative">
                                        <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.discount || ""}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.duration || ""}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. 5N/4D"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                                        <input
                                            type="radio"
                                            checked={formData.isActive}
                                            onChange={() => setFormData({ ...formData, isActive: true })}
                                            className="form-radio text-blue-600"
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                                        <input
                                            type="radio"
                                            checked={!formData.isActive}
                                            onChange={() => setFormData({ ...formData, isActive: false })}
                                            className="form-radio text-gray-600"
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Tags Selection */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <p className="text-xs text-gray-500 mb-3">
                                    💡 <span className="font-medium">Blue</span> = Selected here | <span className="font-medium text-purple-600">Purple</span> = Linked from Tag Management
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map((tag) => {
                                        const isSelectedHere = formData.tags.includes(tag._id);
                                        const isLinkedFromTagMgmt = editingPackage && tag.packages && tag.packages.includes(editingPackage._id);
                                        const isBothWays = isSelectedHere && isLinkedFromTagMgmt;

                                        return (
                                            <button
                                                key={tag._id}
                                                type="button"
                                                onClick={() => {
                                                    const newTags = formData.tags.includes(tag._id)
                                                        ? formData.tags.filter((id: string) => id !== tag._id)
                                                        : [...formData.tags, tag._id];
                                                    setFormData({ ...formData, tags: newTags });
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all relative ${isBothWays
                                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                                    : isSelectedHere
                                                        ? "bg-blue-600 text-white"
                                                        : isLinkedFromTagMgmt
                                                            ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                title={
                                                    isBothWays
                                                        ? "Synced both ways ✓"
                                                        : isLinkedFromTagMgmt
                                                            ? "Linked from Tag Management (click to also select here)"
                                                            : isSelectedHere
                                                                ? "Selected here (will sync to Tag Management)"
                                                                : "Click to select"
                                                }
                                            >
                                                {tag.name}
                                                {isLinkedFromTagMgmt && !isSelectedHere && (
                                                    <span className="ml-1 text-purple-500">🔗</span>
                                                )}
                                                {isBothWays && (
                                                    <span className="ml-1">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    {allTags.length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No tags available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                                <RichTextEditor
                                    value={formData.description || ""}
                                    onChange={(value) => setFormData({ ...formData, description: value })}
                                    contentType="packages"
                                    className="min-h-[240px]"
                                    editorViewportClassName="max-h-[320px]"
                                    placeholder="Full details about the package..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Shimla, Himachal Pradesh"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                    <select
                                        value={selectedCountryIso2}
                                        onChange={handleCountryChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select Country</option>
                                        {countryOptions.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State (Optional)</label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setFormData({ ...formData, state: e.target.value });
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        disabled={!selectedCountryIso2 || states.length === 0}
                                    >
                                        <option value="">Select State</option>
                                        {states.map((state) => (
                                            <option key={state.name} value={state.name}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tour Type</label>
                                <select
                                    value={formData.tourType}
                                    onChange={(e) => setFormData({ ...formData, tourType: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="india">India</option>
                                    <option value="international">International</option>
                                </select>
                            </div>

                            {/* Destinations Covered */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Destinations Covered</label>
                                <p className="text-xs text-gray-500 mb-3">Select destinations covered by this package. Manage these in the sidebar.</p>
                                <div className="flex flex-wrap gap-2">
                                    {allDestinationCovers.map((dest) => {
                                        const isSelected = (formData.destinationsCovered || []).includes(dest.name);
                                        return (
                                            <button
                                                key={dest._id}
                                                type="button"
                                                onClick={() => {
                                                    const currentDests = formData.destinationsCovered || [];
                                                    const newDests = isSelected 
                                                        ? currentDests.filter((d: string) => d !== dest.name)
                                                        : [...currentDests, dest.name];
                                                    setFormData({ ...formData, destinationsCovered: newDests });
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                    isSelected 
                                                        ? "bg-blue-600 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                            >
                                                {dest.name}
                                                {isSelected && <span className="ml-1">✓</span>}
                                            </button>
                                        );
                                    })}
                                    {allDestinationCovers.length === 0 && (
                                        <p className="text-xs text-gray-500 italic">No destination covers available. Add them in the sidebar.</p>
                                    )}
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Package Image</label>

                                <div className="flex space-x-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('file')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${uploadMethod === 'file'
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Upload size={16} className="inline mr-2" />
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('url')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${uploadMethod === 'url'
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ImageIcon size={16} className="inline mr-2" />
                                        Image URL
                                    </button>
                                </div>

                                {uploadMethod === 'file' ? (
                                    <div key="file-upload-container" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            key="file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer block">
                                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Click to upload image</span>
                                            <p className="text-xs text-gray-400 mt-1">MAX. 220KB</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div key="url-upload-container">
                                        <input
                                            key="url-input"
                                            type="text"
                                            value={imageUrl || ""}
                                            onChange={handleImageUrlChange}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                )}

                                {imagePreview && (() => {
                                    const isValidUrl = (url: string) => {
                                        if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return true;
                                        try {
                                            new URL(url);
                                            return true;
                                        } catch {
                                            return false;
                                        }
                                    };

                                    if (!isValidUrl(imagePreview)) {
                                        return (
                                            <div className="mt-4 flex flex-col items-center justify-center h-44 w-full rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-red-400 p-4 transition-all animate-in fade-in zoom-in duration-300">
                                                <div className="bg-red-100 p-2 rounded-full mb-2">
                                                    <ImageIcon size={24} className="text-red-500 opacity-80" />
                                                </div>
                                                <p className="text-xs font-bold text-red-600">Invalid Image URL</p>
                                                <p className="text-[10px] text-red-400 mt-1 mb-3 text-center">The URL you entered is not a valid web address.</p>
                                                <button
                                                    onClick={clearImageSelection}
                                                    className="px-4 py-1.5 bg-white border border-red-200 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                                >
                                                    Clear and Try Again
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="mt-4 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 group">
                                            <img
                                                src={imagePreview}
                                                alt={formData.imageAlt || "Preview"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Handle broken images
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={clearImageSelection}
                                                    className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-lg transform hover:scale-110 transition-all"
                                                    title="Remove image"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                                <input
                                    type="text"
                                    value={formData.imageAlt}
                                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                                    placeholder="Describe the package cover image"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Used for accessibility and SEO.</p>
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 relative z-10">
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(false);
                            }}
                            className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={editingPackage ? handleUpdatePackage : handleCreatePackage}
                            disabled={submitting}
                            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {editingPackage ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                <>{editingPackage ? 'Update Package' : 'Create Package'}</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Packages List */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                {["Package Details", "Duration", "Pricing", "Location", "Status", "Actions"].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 size={32} className="mx-auto animate-spin text-blue-500" />
                                        <p className="mt-2 text-gray-500">Loading packages...</p>
                                    </td>
                                </tr>
                            ) : currentPackages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No packages found. Add your first package to get started.
                                    </td>
                                </tr>
                            ) : (
                                currentPackages.map((pkg) => (
                                    <tr key={pkg._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                                                    {pkg.image ? (
                                                        <img src={pkg.image} alt={pkg.imageAlt || pkg.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{pkg.name}</div>
                                                    <div className="text-xs text-gray-500">{pkg.tourType}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {pkg.duration}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{pkg.price.toLocaleString()}
                                            <span className="ml-2 text-[10px] uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {getPriceTypeLabel(pkg.priceType)}
                                            </span>
                                            {pkg.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through ml-2">₹{pkg.originalPrice.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {pkg.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                onClick={() => togglePackageStatus(pkg)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer select-none ${pkg.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {pkg.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => setPreviewPackage(pkg)}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg transition disabled:opacity-50"
                                                    title="Preview"
                                                    disabled={submitting}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditPackage(pkg)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg transition disabled:opacity-50"
                                                    disabled={submitting}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(pkg._id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                                                    disabled={submitting || deletingId === pkg._id}
                                                >
                                                    {deletingId === pkg._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className=" px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPackages.length)} of {filteredPackages.length} results
                        </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 cursor-pointer text-slate-700 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => paginate(idx + 1)}
                                    className={`px-4 py-2 border rounded-xl text-sm font-bold cursor-pointer transition-all shadow-sm ${currentPage === idx + 1
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100 shadow-lg'
                                        : 'border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-slate-700 cursor-pointer border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Preview Modal */}
            {previewPackage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
                        <div className="relative h-52 w-full shrink-0">
                            {previewPackage.image ? (
                                <img
                                    src={previewPackage.image}
                                    alt={previewPackage.imageAlt || previewPackage.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <ImageIcon size={64} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => setPreviewPackage(null)}
                                    className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg text-gray-800 hover:bg-white transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {previewPackage.tourType}
                                </span>
                                <h3 className="text-2xl font-bold text-white mt-2 leading-tight line-clamp-2">
                                    {previewPackage.name}
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                    <Clock className="text-blue-500" size={18} />
                                    <span className="font-semibold text-gray-700">{previewPackage.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                    <MapPin className="text-red-500" size={18} />
                                    <span className="font-semibold text-gray-700">{previewPackage.location}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-2xl border border-green-100">
                                    <IndianRupee className="text-green-600" size={18} />
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-green-700 text-lg">₹{previewPackage.price.toLocaleString()}</span>
                                        <span className="text-[10px] uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                            {getPriceTypeLabel(previewPackage.priceType)}
                                        </span>
                                        {previewPackage.originalPrice && (
                                            <span className="text-xs text-gray-400 line-through">₹{previewPackage.originalPrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Short Description</h4>
                                    <div className="text-gray-600 leading-relaxed font-medium max-h-28 overflow-y-auto custom-scrollbar pr-2">
                                        {previewPackage.shortDescription}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Full Details</h4>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-line custom-scrollbar max-h-40 overflow-y-auto pr-2">
                                        {previewPackage.description}
                                    </div>
                                </div>
                                {(() => {
                                    const linkedTags = allTags
                                        .filter(tag => tag.packages && tag.packages.includes(previewPackage._id))
                                        .map(tag => tag._id);
                                    const allMergedTags = Array.from(new Set([...(previewPackage.tags || []), ...linkedTags]));

                                    if (allMergedTags.length === 0) return null;

                                    return (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {allMergedTags.map((tagId, idx) => {
                                                    const tag = allTags.find(t => t._id === tagId);
                                                    if (!tag) return null;
                                                    return (
                                                        <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold border border-blue-100">
                                                            #{tag.name}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`h-3 w-3 rounded-full ${previewPackage.isActive ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></span>
                                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                        {previewPackage.isActive ? 'Active' : 'Inactive'} Status
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setPreviewPackage(null);
                                        handleEditPackage(previewPackage);
                                    }}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                >
                                    Edit This Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDeleteId !== null}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    if (confirmDeleteId) {
                        handleDeletePackage(confirmDeleteId);
                    }
                }}
                title="Delete Package"
                message={`Are you sure you want to delete this package? This will permanently remove all package data and unlink it from all associated tags.`}
            />
        </div>
    );
};

export default AdminPackages;
