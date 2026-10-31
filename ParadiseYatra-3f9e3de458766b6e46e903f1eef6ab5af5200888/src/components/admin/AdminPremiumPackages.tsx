"use client";

import React, { useState, useEffect } from "react";
import { Crown, Star, MapPin, Clock, Edit, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import { getImageUrl } from "@/lib/utils";
import { PACKAGE_CATEGORIES, TOUR_TYPES } from "@/config/categories";
import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

interface PremiumPackage {
  _id: string;
  title: string;
  slug?: string;
  duration: string;
  destination: string;
  country: string;
  state?: string;
  tourType: string;
  price: number;
  originalPrice?: number;
  rating: number;
  images: string[];
  imageAlt?: string;
  category: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  inclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminPremiumPackages = () => {
  const [premiumPackages, setPremiumPackages] = useState<PremiumPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PremiumPackage | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PremiumPackage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Country and state management
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [states, setStates] = useState<Array<{ name: string; state_code: string }>>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    destination: "",
    country: "",
    state: "",
    tourType: "",
    price: "",
    originalPrice: "",
    rating: "",
    images: "",
    imageAlt: "",
    category: "Premium Packages",
    description: "",
    shortDescription: "",
    highlights: "",
    inclusions: "",
    isActive: true,
    isFeatured: false
  });

  // Get all countries
  const countries = React.useMemo(() => {
    return Country.getAllCountries().map((c: ICountry) => ({
      iso2: c.isoCode,
      name: c.name,
    }));
  }, []);

  // Transform countries for dropdown
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

  // Fetch premium packages
  const fetchPremiumPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/packages/category/Premium%20Packages?limit=100', {
        headers
      });
      if (!response.ok) {
        throw new Error('Failed to fetch premium packages');
      }
      
      const data = await response.json();
      // Handle both array response and object with packages property
      const packagesArray = Array.isArray(data) ? data : (data.packages || []);
      console.log('Fetched premium packages:', packagesArray.length, packagesArray);
      setPremiumPackages(packagesArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPremiumPackages();
  }, []);

  const handleAddPackage = async () => {
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      // Check if we need to upload a file
      const hasFileUpload = formData.images && (formData.images.startsWith('blob:') || formData.images.startsWith('data:'));
      
      // Convert ISO codes to actual names for submission
      let countryName = formData.country;
      let stateName = formData.state;
      
      if (selectedCountryIso2) {
        const selectedCountry = countries.find(c => c.iso2 === selectedCountryIso2);
        countryName = selectedCountry ? selectedCountry.name : selectedCountryIso2;
      }
      if (selectedState) {
        const selectedStateObj = states.find(s => s.name === selectedState);
        stateName = selectedStateObj ? selectedStateObj.name : selectedState;
      }

      // Generate slug from title if not provided
      const generateSlug = (title: string): string => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
      };

      const packageData = {
        ...formData,
        slug: formData.title ? generateSlug(formData.title) : '', // Generate slug from title
        tourType: formData.tourType || 'india', // Ensure tourType is always present, default to 'india'
        country: countryName,
        state: stateName,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        images: formData.images ? [formData.images] : [],
        imageAlt: formData.imageAlt.trim(),
        highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : [],
        inclusions: formData.inclusions ? formData.inclusions.split(',').map(i => i.trim()) : []
      };

      let response;
      if (hasFileUpload) {
        // Handle file upload
        const uploadFormData = new FormData();
        
        // Convert image to file FIRST (await it)
        let imageFile: File | null = null;
        if (formData.images) {
          if (formData.images.startsWith('blob:')) {
            const res = await fetch(formData.images);
            const blob = await res.blob();
            imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          } else if (formData.images.startsWith('data:')) {
            const res = await fetch(formData.images);
            const blob = await res.blob();
            imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          }
        }
        
        // Add image file if we have one
        if (imageFile) {
          uploadFormData.append('image', imageFile);
        }
        
        // Add all form fields (excluding images array, we handle that separately above)
        Object.keys(packageData).forEach(key => {
          const value = (packageData as unknown as Record<string, unknown>)[key];
          if (key === 'images') {
            // Skip images - we already handled it above
            return;
          } else if (Array.isArray(value)) {
            uploadFormData.append(key, JSON.stringify(value));
          } else {
            uploadFormData.append(key, String(value));
          }
        });

        response = await fetch('/api/packages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
      } else {
        // Handle regular JSON data
        response = await fetch('/api/packages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(packageData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create package');
      }

      await fetchPremiumPackages();
      resetForm();
      toast.success('Premium package added successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create package';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPackage = (pkg: PremiumPackage) => {
    setEditingPackage(pkg);
    
    // Set country and state
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
    
    setFormData({
      title: pkg.title,
      duration: pkg.duration,
      destination: pkg.destination,
      country: pkg.country,
      state: pkg.state || "",
      tourType: pkg.tourType,
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() || "",
      rating: pkg.rating.toString(),
      images: pkg.images[0] || "",
      imageAlt: pkg.imageAlt || "",
      category: pkg.category,
      description: pkg.description,
      shortDescription: pkg.shortDescription,
      highlights: pkg.highlights.join(', '),
      inclusions: pkg.inclusions.join(', '),
      isActive: pkg.isActive,
      isFeatured: pkg.isFeatured
    });
    setShowAddForm(true);
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      // Check if image has changed (compare with original)
      const originalImageUrl = editingPackage.images && editingPackage.images.length > 0 ? editingPackage.images[0] : '';
      const imageChanged = formData.images && formData.images !== originalImageUrl;
      
      // Check if we need to upload a file (blob/data URLs need file upload)
      const hasFileUpload = formData.images && (formData.images.startsWith('blob:') || formData.images.startsWith('data:'));
      
      // Convert ISO codes to actual names for submission
      let countryName = formData.country;
      let stateName = formData.state;
      
      if (selectedCountryIso2) {
        const selectedCountry = countries.find(c => c.iso2 === selectedCountryIso2);
        countryName = selectedCountry ? selectedCountry.name : selectedCountryIso2;
      }
      if (selectedState) {
        const selectedStateObj = states.find(s => s.name === selectedState);
        stateName = selectedStateObj ? selectedStateObj.name : selectedState;
      }

      const packageData = {
        ...formData,
        slug: editingPackage?.slug || '', // Always include slug from original package
        tourType: formData.tourType || editingPackage?.tourType || 'india', // Ensure tourType is always present
        country: countryName,
        state: stateName,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        images: formData.images ? [formData.images] : [],
        imageAlt: formData.imageAlt.trim(),
        highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : [],
        inclusions: formData.inclusions ? formData.inclusions.split(',').map(i => i.trim()) : []
      };

      let response;
      if (hasFileUpload) {
        // Handle file upload (blob/data URLs)
        const uploadFormData = new FormData();
        
        // Convert image to file FIRST (await it)
        let imageFile: File | null = null;
        if (formData.images) {
          if (formData.images.startsWith('blob:')) {
            const res = await fetch(formData.images);
            const blob = await res.blob();
            imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          } else if (formData.images.startsWith('data:')) {
            const res = await fetch(formData.images);
            const blob = await res.blob();
            imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          }
        }
        
        // Add image file if we have one
        if (imageFile) {
          uploadFormData.append('image', imageFile);
        }
        
        // Add all form fields (excluding images array, we handle that separately above)
        Object.keys(packageData).forEach(key => {
          const value = (packageData as unknown as Record<string, unknown>)[key];
          if (key === 'images') {
            // Skip images - we already handled it above
            return;
          } else if (Array.isArray(value)) {
            uploadFormData.append(key, JSON.stringify(value));
          } else {
            uploadFormData.append(key, String(value));
          }
        });

        response = await fetch(`/api/packages/${editingPackage._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
      } else {
        // No image change - just send JSON
        response = await fetch(`/api/packages/${editingPackage._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(packageData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update package');
      }

      await fetchPremiumPackages();
      setEditingPackage(null);
      resetForm();
      toast.success('Premium package updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update package';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
      }

      await fetchPremiumPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePackageStatus = async (pkg: PremiumPackage) => {
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch(`/api/packages/${pkg._id}`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update package status');
      }

      await fetchPremiumPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package status');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      duration: "",
      destination: "",
      country: "",
      state: "",
      tourType: "",
      price: "",
      originalPrice: "",
      rating: "",
      images: "",
      imageAlt: "",
      category: "Premium Packages",
      description: "",
      shortDescription: "",
      highlights: "",
      inclusions: "",
      isActive: true,
      isFeatured: false
    });
    setSelectedCountryIso2("");
    setSelectedState("");
    setStates([]);
    setShowAddForm(false);
    setEditingPackage(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(premiumPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = premiumPackages.slice(startIndex, endIndex);
  
  // Debug pagination
  console.log('Pagination Debug:', {
    totalPackages: premiumPackages.length,
    itemsPerPage,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedCount: paginatedPackages.length
  });

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading premium packages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-8 h-8 text-purple-600" />
            Premium Packages
          </h1>
          <p className="text-gray-600">Manage your luxury premium travel packages and exclusive offerings.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Premium Package
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            {editingPackage ? "Edit Premium Package" : "Add New Premium Package"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Luxury Maldives Escape"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 7N-8D"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Maldives"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <select
                value={selectedCountryIso2}
                onChange={handleCountryChange}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setFormData(prev => ({ ...prev, state: e.target.value }));
                }}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!selectedCountryIso2 || states.length === 0}
              >
                <option value="">{!selectedCountryIso2 ? 'Select country first' : states.length === 0 ? 'No states available' : 'Select state'}</option>
                {states.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tour Type *</label>
              <select
                value={formData.tourType}
                onChange={(e) => setFormData({ ...formData, tourType: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Tour Type</option>
                {TOUR_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Category</option>
                {PACKAGE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 250000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 300000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 4.9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <select
                value={formData.isFeatured ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.value === "true" })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={formData.images}
                onChange={(value) => setFormData({ ...formData, images: value })}
                label="Package Image"
                contentType="premium-packages"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
              <input
                type="text"
                value={formData.imageAlt}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the package cover image"
              />
              <p className="text-xs text-gray-500 mt-1">Used for accessibility and SEO.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the package..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Enter detailed package description..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlights (comma-separated)</label>
              <input
                type="text"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., All Inclusive, Private Pool, Spa Access, Water Sports"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions (comma-separated)</label>
              <input
                type="text"
                value={formData.inclusions}
                onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Accommodation, Meals, Transfers, Guide"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingPackage ? handleUpdatePackage : handleAddPackage}
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingPackage ? "Update Package" : "Add Package"}
            </button>
            <button
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-purple-100">Total Packages</p>
              <p className="text-2xl !text-white font-bold">{premiumPackages.length}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-green-100">Active Packages</p>
              <p className="text-2xl !text-white font-bold">{premiumPackages.filter(p => p.isActive).length}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-blue-100">Featured Packages</p>
              <p className="text-2xl !text-white font-bold">{premiumPackages.filter(p => p.isFeatured).length}</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-yellow-100">Avg Rating</p>
              <p className="text-2xl !text-white font-bold">
                {premiumPackages.length > 0 
                  ? (premiumPackages.reduce((sum, p) => sum + p.rating, 0) / premiumPackages.length).toFixed(1)
                  : "0.0"
                }
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Premium Packages</h2>
        </div>
        {premiumPackages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Crown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No premium packages found. Add your first premium package to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPackages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden relative">
                          <Image 
                            src={getImageUrl(pkg.images[0]) || "https://via.placeholder.com/48x48?text=No+Image"} 
                            alt={pkg.imageAlt || pkg.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                          <div className="text-xs text-gray-500">{pkg.isFeatured ? "Featured" : "Premium"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.tourType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {pkg.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-semibold text-purple-600">₹{pkg.price.toLocaleString()}</div>
                        {pkg.originalPrice && (
                          <div className="text-xs text-gray-400 line-through">₹{pkg.originalPrice.toLocaleString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{pkg.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePackageStatus(pkg)}
                        disabled={submitting}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pkg.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        } disabled:opacity-50`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPackage(pkg)}
                          className="text-blue-600 hover:text-blue-900 hover:cursor-pointer hover:scale-105 transition-transform"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          disabled={submitting}
                          className="text-purple-600 hover:text-purple-900 hover:cursor-pointer hover:scale-105 transition-transform disabled:opacity-50"
                          title="Edit Package"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg._id)}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer hover:scale-105 transition-transform disabled:opacity-50"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {premiumPackages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, premiumPackages.length)} of {premiumPackages.length} packages
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {totalPages > 1 && (
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Package Details</h3>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="w-full h-48 rounded-lg overflow-hidden relative">
                <Image 
                  src={getImageUrl(selectedPackage.images[0]) || "https://via.placeholder.com/400x200?text=No+Image"} 
                  alt={selectedPackage.imageAlt || selectedPackage.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedPackage.title}</h4>
                <p className="text-gray-600 mt-2">{selectedPackage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Destination:</span>
                  <p className="text-gray-900">{selectedPackage.destination}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration:</span>
                  <p className="text-gray-900">{selectedPackage.duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Country:</span>
                  <p className="text-gray-900">{selectedPackage.country}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">State:</span>
                  <p className="text-gray-900">{selectedPackage.state || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tour Type:</span>
                  <p className="text-gray-900">{selectedPackage.tourType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900">{selectedPackage.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <p className="text-gray-900">₹{selectedPackage.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rating:</span>
                  <p className="text-gray-900">{selectedPackage.rating.toFixed(1)}</p>
                </div>
              </div>
              {selectedPackage.highlights.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Highlights:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPackage.highlights.map((highlight, index) => (
                      <span key={`highlight-${index}-${highlight}`} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPackage.inclusions.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Inclusions:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPackage.inclusions.map((inclusion, index) => (
                      <span key={`inclusion-${index}-${inclusion}`} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {inclusion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPremiumPackages; 
