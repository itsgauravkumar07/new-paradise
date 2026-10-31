"use client";

import React, { useState, useEffect } from "react";
import { Mountain, Star, MapPin, Clock, Users, Edit, Trash2, Plus, Eye, Zap } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import { getImageUrl } from "@/lib/utils";
import { PACKAGE_CATEGORIES, TOUR_TYPES } from "@/config/categories";
import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

interface AdventurePackage {
  _id: string;
  title: string;
  slug: string;
  duration: string;
  destination: string;
  country: string;
  state: string;
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
  isActive: boolean;
  isFeatured: boolean;
}

interface PackageData {
  title: string;
  slug?: string;
  duration: string;
  destination: string;
  country: string;
  state: string;
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
  isActive: boolean;
}

const AdminAdventurePackages = () => {
  const [adventurePackages, setAdventurePackages] = useState<AdventurePackage[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdventurePackage | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AdventurePackage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Country and state management
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [states, setStates] = useState<Array<{ name: string; state_code: string }>>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
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
    category: "Adventure Tours",
    description: "",
    shortDescription: "",
    highlights: "",
    isActive: true
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

  useEffect(() => {
    const fetchAdventurePackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/packages?category=Adventure%20Tours&limit=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch adventure packages');
        }
        
        const data = await response.json();
        // Extract packages array from the response
        const packagesArray = data.packages || data;
        console.log('Fetched adventure packages:', packagesArray.length, packagesArray);
        setAdventurePackages(packagesArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching adventure packages:', err);
        setError('Failed to load adventure packages');
        setAdventurePackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdventurePackages();
  }, []);

  const handleAddPackage = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please log in to add packages');
        return;
      }

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Package title is required');
        return;
      }
      if (!formData.duration.trim()) {
        toast.error('Duration is required');
        return;
      }
      if (!formData.destination.trim()) {
        toast.error('Destination is required');
        return;
      }
      if (!formData.country.trim()) {
        toast.error('Country is required');
        return;
      }
      if (!formData.tourType.trim()) {
        toast.error('Tour type is required');
        return;
      }
      if (!formData.price.trim()) {
        toast.error('Price is required');
        return;
      }

      // Parse and validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Parse and validate original price if provided
      let originalPrice;
      if (formData.originalPrice.trim()) {
        originalPrice = parseFloat(formData.originalPrice);
        if (isNaN(originalPrice) || originalPrice <= 0) {
          toast.error('Please enter a valid original price');
          return;
        }
      }

      // Parse and validate rating
      const rating = parseFloat(formData.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        toast.error('Please enter a valid rating between 0 and 5');
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

      const packageData: PackageData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        duration: formData.duration.trim(),
        destination: formData.destination.trim(),
        country: countryName,
        state: stateName,
        tourType: formData.tourType.trim(),
        price: price,
        originalPrice: originalPrice,
        rating: rating,
        images: formData.images.split(',').map(img => img.trim()).filter(img => img),
        imageAlt: formData.imageAlt.trim(),
        category: formData.category,
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        highlights: formData.highlights.split(',').map(h => h.trim()).filter(h => h),
        isActive: formData.isActive
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
        
        // Add contentType for Cloudinary folder organization
        uploadFormData.append('contentType', 'adventure-packages');
        
        // Add all form fields (excluding images array, we handle that separately above)
        Object.keys(packageData).forEach(key => {
          const value = packageData[key as keyof PackageData];
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

      const data = await response.json();

      if (response.ok) {
        // Refresh the packages list
        const refreshResponse = await fetch('/api/packages?category=Adventure%20Tours');
        const refreshData = await refreshResponse.json();
        // Handle both array response and object with packages property
        const packagesArray = Array.isArray(refreshData) ? refreshData : (refreshData.packages || []);
        setAdventurePackages(packagesArray);
        resetForm();
        toast.success('Adventure package added successfully!');
      } else {
        toast.error(`Failed to add package: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding package:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleEditPackage = (pkg: AdventurePackage) => {
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
      slug: pkg.slug || "",
      duration: pkg.duration,
      destination: pkg.destination,
      country: pkg.country,
      state: pkg.state || "",
      tourType: pkg.tourType,
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() || "",
      rating: pkg.rating.toString(),
      images: pkg.images.join(', '),
      imageAlt: pkg.imageAlt || "",
      category: pkg.category,
      description: pkg.description,
      shortDescription: pkg.shortDescription,
      highlights: pkg.highlights.join(', '),
      isActive: pkg.isActive
    });
    setShowAddForm(true);
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please log in to update packages');
        return;
      }

      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Package title is required');
        return;
      }
      if (!formData.duration.trim()) {
        toast.error('Duration is required');
        return;
      }
      if (!formData.destination.trim()) {
        toast.error('Destination is required');
        return;
      }
      if (!formData.country.trim()) {
        toast.error('Country is required');
        return;
      }
      if (!formData.tourType.trim()) {
        toast.error('Tour type is required');
        return;
      }
      if (!formData.price.trim()) {
        toast.error('Price is required');
        return;
      }

      // Parse and validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      // Parse and validate original price if provided
      let originalPrice;
      if (formData.originalPrice.trim()) {
        originalPrice = parseFloat(formData.originalPrice);
        if (isNaN(originalPrice) || originalPrice <= 0) {
          toast.error('Please enter a valid original price');
          return;
        }
      }

      // Parse and validate rating
      const rating = parseFloat(formData.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        toast.error('Please enter a valid rating between 0 and 5');
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

      const packageData: PackageData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        duration: formData.duration.trim(),
        destination: formData.destination.trim(),
        country: countryName,
        state: stateName,
        tourType: formData.tourType.trim(),
        price: price,
        originalPrice: originalPrice,
        rating: rating,
        images: formData.images.split(',').map((img: string) => img.trim()).filter(img => img),
        imageAlt: formData.imageAlt.trim(),
        category: formData.category,
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),
        highlights: formData.highlights.split(',').map((h: string) => h.trim()).filter(h => h),
        isActive: formData.isActive
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
        
        // Add contentType for Cloudinary folder organization
        uploadFormData.append('contentType', 'adventure-packages');
        
        // Add all form fields (excluding images array, we handle that separately above)
        Object.keys(packageData).forEach(key => {
          const value = packageData[key as keyof PackageData];
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
        // Handle regular JSON data
        response = await fetch(`/api/packages/${editingPackage._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(packageData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        // Refresh the packages list
        const refreshResponse = await fetch('/api/packages?category=Adventure%20Tours');
        const refreshData = await refreshResponse.json();
        // Handle both array response and object with packages property
        const packagesArray = Array.isArray(refreshData) ? refreshData : (refreshData.packages || []);
        setAdventurePackages(packagesArray);
        setEditingPackage(null);
        resetForm();
        toast.success('Adventure package updated successfully!');
      } else {
        toast.error(`Failed to update package: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this adventure package?')) {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          toast.error('Please log in to delete packages');
          return;
        }
        
        const response = await fetch(`/api/packages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Refresh the packages list
          const refreshResponse = await fetch('/api/packages?category=Adventure%20Tours');
          const refreshData = await refreshResponse.json();
          // Handle both array response and object with packages property
          const packagesArray = Array.isArray(refreshData) ? refreshData : (refreshData.packages || []);
          setAdventurePackages(packagesArray);
          toast.success('Adventure package deleted successfully!');
        } else {
          toast.error(`Failed to delete package: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        toast.error('Network error. Please try again.');
      }
    }
  };

  const togglePackageStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please log in to update package status');
        return;
      }

      const packageToUpdate = adventurePackages.find(pkg => pkg._id === id);
      if (!packageToUpdate) return;

              const response = await fetch(`/api/packages/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...packageToUpdate,
            isActive: !packageToUpdate.isActive
          }),
        });

      if (response.ok) {
        // Refresh the packages list
        const refreshResponse = await fetch('/api/packages?category=Adventure%20Tours');
        const refreshData = await refreshResponse.json();
        // Handle both array response and object with packages property
        const packagesArray = Array.isArray(refreshData) ? refreshData : (refreshData.packages || []);
        setAdventurePackages(packagesArray);
      } else {
        toast.error('Failed to update package status');
      }
    } catch (error) {
      console.error('Error updating package status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
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
      category: "Adventure Tours",
      description: "",
      shortDescription: "",
      highlights: "",
      isActive: true
    });
    setSelectedCountryIso2("");
    setSelectedState("");
    setStates([]);
    setShowAddForm(false);
    setEditingPackage(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(adventurePackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = adventurePackages.slice(startIndex, endIndex);
  
  // Debug pagination
  console.log('Pagination Debug:', {
    totalPackages: adventurePackages.length,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Mountain className="w-8 h-8 text-green-600" />
            Adventure Packages
          </h1>
          <p className="text-gray-600">Manage your thrilling adventure travel packages and expeditions.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Adventure Package
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-green-600" />
            {editingPackage ? "Edit Adventure Package" : "Add New Adventure Package"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Himalayan Trekking"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL-friendly)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., himalayan-trekking (auto-generated if empty)"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 10N-11D"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Nepal Himalayas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={selectedCountryIso2}
                onChange={handleCountryChange}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tour Type</label>
              <select
                value={formData.tourType}
                onChange={(e) => setFormData({ ...formData, tourType: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                                 <option value="">Select Tour Type</option>
                 {TOUR_TYPES.map(type => (
                   <option key={type.value} value={type.value}>{type.label}</option>
                 ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., ₹45,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
              <input
                type="text"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., ₹55,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <input
                type="text"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 4.8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Mountain adventure with expert guides"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlights (comma-separated)</label>
              <input
                type="text"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Expert Guides, Camping, Mountain Views, Local Culture"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                                 {PACKAGE_CATEGORIES.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Status</label>
              <select
                value={formData.isActive ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                value={formData.images}
                onChange={(value) => setFormData({ ...formData, images: value })}
                label="Package Image"
                contentType="adventure-packages"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
              <input
                type="text"
                value={formData.imageAlt}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe the package cover image"
              />
              <p className="text-xs text-gray-500 mt-1">Used for accessibility and SEO.</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter package description..."
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingPackage ? handleUpdatePackage : handleAddPackage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingPackage ? "Update Package" : "Add Package"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-green-100">Total Packages</p>
              <p className="text-2xl !text-white font-bold">{adventurePackages.length}</p>
            </div>
            <Mountain className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-blue-100">Active Packages</p>
              <p className="text-2xl !text-white font-bold">{adventurePackages.filter(p => p.isActive).length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-purple-100">Total Highlights</p>
              <p className="text-2xl !text-white font-bold">{adventurePackages.reduce((sum, p) => sum + (p.highlights?.length || 0), 0).toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-yellow-100">Avg Rating</p>
              <p className="text-2xl !text-white font-bold">
                {(adventurePackages.reduce((sum, p) => sum + p.rating, 0) / adventurePackages.length).toFixed(1)}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Adventure Packages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booked
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
                          src={getImageUrl(pkg.images?.[0]) || "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                          alt={pkg.imageAlt || pkg.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pkg.title}</div>
                        <div className="text-xs text-gray-500">Adventure</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {pkg.slug || 'N/A'}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {pkg.destination}, {pkg.country}
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
                      <div className="font-semibold text-green-600">₹{pkg.price?.toLocaleString()}</div>
                      {pkg.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">₹{pkg.originalPrice.toLocaleString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {pkg.tourType || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {pkg.category || 'Adventure Tours'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                      {pkg.state || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{pkg.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      {pkg.highlights?.length || 0} highlights
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePackageStatus(pkg._id)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pkg.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pkg.isActive ? "active" : "inactive"}
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
                        className="text-green-600 hover:text-green-900 hover:cursor-pointer hover:scale-105 transition-transform"
                        title="Edit Package"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="text-red-600 hover:text-red-900 hover:cursor-pointer hover:scale-105 transition-transform"
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
      </div>

      {/* Pagination Controls */}
      {adventurePackages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, adventurePackages.length)} of {adventurePackages.length} packages
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
                          ? 'bg-green-600 text-white'
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
                  src={getImageUrl(selectedPackage.images?.[0]) || "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
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
                  <span className="text-sm font-medium text-gray-500">Slug:</span>
                  <p className="text-gray-900 font-mono text-sm">{selectedPackage.slug || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Destination:</span>
                  <p className="text-gray-900">{selectedPackage.destination}, {selectedPackage.country}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">State:</span>
                  <p className="text-gray-900">{selectedPackage.state || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration:</span>
                  <p className="text-gray-900">{selectedPackage.duration}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Tour Type:</span>
                  <p className="text-gray-900">{selectedPackage.tourType || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Price:</span>
                  <p className="text-gray-900">₹{selectedPackage.price?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rating:</span>
                  <p className="text-gray-900">{selectedPackage.rating}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900">{selectedPackage.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-gray-900">{selectedPackage.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Highlights:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPackage.highlights?.map((highlight: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdventurePackages; 
