"use client";

import React, { useState, useEffect } from "react";
import { Crown, Star, MapPin, Clock, Edit, Trash2, Plus, Eye, Loader2, Upload, Image as ImageIcon, Percent, Globe, Search, Save, X, Check } from "lucide-react";
import Image from "next/image";
import { API_CONFIG } from "@/config/api";
import { toast } from "react-toastify";
import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

interface TrendingDestination {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  imageAlt?: string;
  destination: string;
  country: string;
  state?: string;
  tourType: string;
  category: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: string;
  highlights: string[];
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

const PACKAGE_CATEGORIES = [
  "Beach Holidays",
  "Adventure Tours",
  "Trending Destinations",
  "Premium Packages",
  "Popular Packages",
  "Fixed Departure",
  "Mountain Treks",
  "Wildlife Safaris",
  "Pilgrimage Tours",
  "Honeymoon Packages",
  "Family Tours",
  "Luxury Tours",
  "Budget Tours",
];

const TOUR_TYPES = [
  { value: "india", label: "India Tours" },
  { value: "international", label: "International Tours" },
];

const AdminTrendingDestinations = () => {
  const [trendingDestinations, setTrendingDestinations] = useState<TrendingDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState<TrendingDestination | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<TrendingDestination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  // Country and state management
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [states, setStates] = useState<Array<{ name: string; state_code: string }>>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    image: "",
    imageAlt: "",
    destination: "",
    country: "",
    state: "",
    tourType: "",
    category: "Trending Destinations",
    rating: "",
    price: "",
    originalPrice: "",
    discount: "",
    duration: "",
    highlights: "",
    isActive: true,
    isFeatured: true
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
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);

    if (url) {
      setImagePreview(url);
      setFormData(prev => ({ ...prev, image: url }));
    } else {
      setImagePreview("");
      setFormData(prev => ({ ...prev, image: "" }));
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
  };

  const fetchTrendingDestinations = async () => {
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

      const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}?category=Trending%20Destinations`), {
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending destinations');
      }

      const data = await response.json();
      // Backend returns { packages: [...], pagination: {...} }
      const destinationsArray = data.packages || (Array.isArray(data) ? data : []);
      setTrendingDestinations(destinationsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingDestinations();
  }, []);

  const handleAddDestination = async () => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      if (!formData.title || !formData.slug || !formData.description || !formData.shortDescription || !formData.destination || !formData.country || !formData.tourType) {
        toast.error('Please fill in all required fields (Title, Slug, Description, Destination, Country, Tour Type)');
        return;
      }



      if (uploadMethod === 'url' && imageUrl) {
        const destinationData = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          shortDescription: formData.shortDescription,
          destination: formData.destination,
          imageAlt: formData.imageAlt.trim(),
          country: formData.country,
          state: formData.state || '',
          tourType: formData.tourType,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          duration: formData.duration,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          images: [imageUrl],
          highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : []
        };

        const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PACKAGES.ALL), {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(destinationData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create destination');
        }

        await fetchTrendingDestinations();
        resetForm();
        toast.success('Trending destination added successfully!');
        return;
      }

      const uploadFormData = new FormData();

      if (imageFile) {
        uploadFormData.append('image', imageFile);
      }

      uploadFormData.append('title', formData.title);
      uploadFormData.append('slug', formData.slug);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('shortDescription', formData.shortDescription);
      uploadFormData.append('imageAlt', formData.imageAlt.trim());
      uploadFormData.append('destination', formData.destination);
      uploadFormData.append('country', formData.country);
      uploadFormData.append('state', formData.state || '');
      uploadFormData.append('tourType', formData.tourType);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('price', formData.price);

      if (formData.originalPrice) {
        uploadFormData.append('originalPrice', formData.originalPrice);
      }
      if (formData.discount) {
        uploadFormData.append('discount', formData.discount);
      }

      uploadFormData.append('rating', formData.rating || '0');
      uploadFormData.append('duration', formData.duration);
      uploadFormData.append('isActive', String(formData.isActive));
      uploadFormData.append('isFeatured', String(formData.isFeatured));

      const highlightsArray = formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : [];
      uploadFormData.append('highlights', JSON.stringify(highlightsArray));

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PACKAGES.ALL), {

        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create destination');
      }

      await fetchTrendingDestinations();
      resetForm();
      toast.success('Trending destination added successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create destination';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDestination = (dest: TrendingDestination) => {
    setEditingDestination(dest);

    // Set country and state
    const country = countries.find(c => c.name === dest.country);
    setSelectedCountryIso2(country?.iso2 || '');
    setSelectedState(dest.state || '');

    if (country?.iso2) {
      const countryStates = State.getStatesOfCountry(country.iso2);
      setStates(countryStates.map((s: IState) => ({
        name: s.name,
        state_code: s.isoCode || '',
      })));
    }

    const existingImage = dest.images && dest.images.length > 0 ? dest.images[0] : '';
    setImagePreview(existingImage);
    setImageUrl(existingImage);
    setUploadMethod('url');

    setFormData({
      title: dest.title,
      slug: dest.slug,
      description: dest.description,
      shortDescription: dest.shortDescription,
      image: existingImage,
      imageAlt: dest.imageAlt || "",
      destination: dest.destination,
      country: dest.country,
      state: dest.state || '',
      tourType: dest.tourType,
      category: dest.category,
      rating: dest.rating.toString(),
      price: dest.price.toString(),
      originalPrice: dest.originalPrice ? dest.originalPrice.toString() : '',
      discount: dest.discount ? dest.discount.toString() : '',
      duration: dest.duration,
      highlights: dest.highlights.join(', '),
      isActive: dest.isActive,
      isFeatured: dest.isFeatured || false
    });
    setShowAddForm(true);
  };

  const handleUpdateDestination = async () => {
    if (!editingDestination) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }


      if (uploadMethod === 'url' && imageUrl && !imageFile) {
        const destinationData = {
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          shortDescription: formData.shortDescription,
          destination: formData.destination,
          imageAlt: formData.imageAlt.trim(),
          country: formData.country,
          state: formData.state || '',
          tourType: formData.tourType,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          duration: formData.duration,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          images: [imageUrl],
          highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : []
        };

        const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${editingDestination._id}`), {

          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(destinationData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update destination');
        }

        await fetchTrendingDestinations();
        setEditingDestination(null);
        resetForm();
        toast.success('Destination updated successfully!');
        return;
      }

      const uploadFormData = new FormData();

      if (imageFile) {
        uploadFormData.append('image', imageFile);
      }

      uploadFormData.append('title', formData.title);
      uploadFormData.append('slug', formData.slug);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('shortDescription', formData.shortDescription);
      uploadFormData.append('imageAlt', formData.imageAlt.trim());
      uploadFormData.append('destination', formData.destination);
      uploadFormData.append('country', formData.country);
      uploadFormData.append('state', formData.state || '');
      uploadFormData.append('tourType', formData.tourType);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('price', formData.price);

      if (formData.originalPrice) {
        uploadFormData.append('originalPrice', formData.originalPrice);
      }
      if (formData.discount) {
        uploadFormData.append('discount', formData.discount);
      }

      uploadFormData.append('rating', formData.rating || '0');
      uploadFormData.append('duration', formData.duration);
      uploadFormData.append('isActive', String(formData.isActive));
      uploadFormData.append('isFeatured', String(formData.isFeatured));

      const highlightsArray = formData.highlights ? formData.highlights.split(',').map(h => h.trim()) : [];
      uploadFormData.append('highlights', JSON.stringify(highlightsArray));

      const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${editingDestination._id}`), {

        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update destination');
      }

      await fetchTrendingDestinations();
      setEditingDestination(null);
      resetForm();
      toast.success('Destination updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update destination';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }


      const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${id}`), {

        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete destination');
      }

      await fetchTrendingDestinations();
      toast.success('Destination deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete destination';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDestinationStatus = async (dest: TrendingDestination) => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }


      const response = await fetch(API_CONFIG.getFullUrl(`${API_CONFIG.ENDPOINTS.PACKAGES.ALL}/${dest._id}`), {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !dest.isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update destination status');
      }

      await fetchTrendingDestinations();
      toast.success('Destination status updated!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update destination status';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      shortDescription: "",
      image: "",
      imageAlt: "",
      destination: "",
      country: "",
      state: "",
      tourType: "",
      category: "Trending Destinations",
      rating: "",
      price: "",
      originalPrice: "",
      discount: "",
      duration: "",
      highlights: "",
      isActive: true,
      isFeatured: true
    });
    setSelectedCountryIso2("");
    setSelectedState("");
    setStates([]);
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setUploadMethod('file');
    setShowAddForm(false);
    setEditingDestination(null);
  };

  const totalPages = Math.ceil(trendingDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDestinations = trendingDestinations.slice(startIndex, endIndex);

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
        <span className="ml-2 text-gray-600">Loading trending destinations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-8 h-8 text-purple-600" />
            Trending Destinations
          </h1>
          <p className="text-gray-600">Manage your trending travel destinations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Destination
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingDestination ? "Edit Destination" : "Add New Destination"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                  setFormData({ ...formData, title: newTitle, slug: newSlug });
                }}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Destination title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="destination-slug"
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
                placeholder="Location"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">State (Optional)</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setFormData(prev => ({ ...prev, state: e.target.value }));
                }}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!selectedCountryIso2 || states.length === 0}
              >
                <option value="">
                  {!selectedCountryIso2
                    ? 'Select country first'
                    : states.length === 0
                      ? 'No states available'
                      : 'Select state (optional)'}
                </option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="5 Days 4 Nights"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="15000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                Original Price (₹)
                <Percent className="w-3 h-3 text-gray-400" />
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="20000"
              />
              <p className="text-xs text-gray-500 mt-1">Price before discount</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                Discount (%)
                <Percent className="w-3 h-3 text-gray-400" />
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="25"
              />
              <p className="text-xs text-gray-500 mt-1">Discount percentage (0-100)</p>
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
                placeholder="4.8"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Upload Method
              </label>

              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod('file');
                    setImageUrl("");
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${uploadMethod === 'file'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod('url');
                    setImageFile(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${uploadMethod === 'url'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Image URL
                </button>
              </div>

              {imagePreview && (
                <div className="mb-4 relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview}
                    alt={formData.imageAlt || "Preview"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadMethod === 'file' && (
                <>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 220KB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>
                  {imageFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {imageFile.name}
                    </p>
                  )}
                </>
              )}

              {uploadMethod === 'url' && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
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
                placeholder="Brief description"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                placeholder="Detailed description"
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
                placeholder="Beach, Adventure, Culture"
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
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingDestination ? handleUpdateDestination : handleAddDestination}
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? (editingDestination ? "Updating..." : "Creating...") : (editingDestination ? "Update" : "Add Destination")}
            </button>
            <button
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-purple-100">Total Destinations</p>
              <p className="text-2xl !text-white font-bold">{trendingDestinations.length}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-green-100">Active</p>
              <p className="text-2xl !text-white font-bold">{trendingDestinations.filter(d => d.isActive).length}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-blue-100">Featured</p>
              <p className="text-2xl !text-white font-bold">{trendingDestinations.filter(d => d.isFeatured).length}</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-yellow-100">Avg Rating</p>
              <p className="text-2xl !text-white font-bold">
                {trendingDestinations.length > 0
                  ? (trendingDestinations.reduce((sum, d) => sum + d.rating, 0) / trendingDestinations.length).toFixed(1)
                  : "0.0"
                }
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Destinations</h2>
        </div>
        {trendingDestinations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Crown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No destinations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDestinations.map((dest) => (
                  <tr key={dest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden relative flex-shrink-0">
                          <img
                            src={dest.images?.[0] || "https://via.placeholder.com/48"}
                            alt={dest.imageAlt || dest.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dest.title}</div>
                          <div className="text-xs text-gray-500">{dest.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {dest.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {dest.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-semibold text-purple-600">₹{dest.price.toLocaleString()}</div>
                        {dest.originalPrice && dest.originalPrice > dest.price && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 line-through">₹{dest.originalPrice.toLocaleString()}</span>
                            {dest.discount && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                {dest.discount}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{dest.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDestinationStatus(dest)}
                        disabled={submitting}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${dest.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {dest.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedDestination(dest)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDestination(dest)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(dest._id)}
                          className="text-red-600 hover:text-red-900"
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

      {trendingDestinations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, trendingDestinations.length)} of {trendingDestinations.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              {totalPages > 1 && (
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
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
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Destination Details</h3>
              <button
                onClick={() => setSelectedDestination(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={selectedDestination.images?.[0] || "https://via.placeholder.com/400x200"}
                  alt={selectedDestination.imageAlt || selectedDestination.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedDestination.title}</h4>
                <p className="text-gray-600 mt-2">{selectedDestination.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Destination:</span>
                  <p className="text-gray-900">{selectedDestination.destination}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Country:</span>
                  <p className="text-gray-900">{selectedDestination.country}</p>
                </div>
                {selectedDestination.state && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">State:</span>
                    <p className="text-gray-900">{selectedDestination.state}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration:</span>
                  <p className="text-gray-900">{selectedDestination.duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <div>
                    <p className="text-gray-900 font-semibold">₹{selectedDestination.price.toLocaleString()}</p>
                    {selectedDestination.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">₹{selectedDestination.originalPrice.toLocaleString()}</p>
                    )}
                    {selectedDestination.discount && (
                      <p className="text-sm text-green-600">{selectedDestination.discount}% discount</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rating:</span>
                  <p className="text-gray-900">{selectedDestination.rating.toFixed(1)}</p>
                </div>
              </div>
              {selectedDestination.highlights.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Highlights:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDestination.highlights.map((highlight, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {highlight}
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

export default AdminTrendingDestinations;
