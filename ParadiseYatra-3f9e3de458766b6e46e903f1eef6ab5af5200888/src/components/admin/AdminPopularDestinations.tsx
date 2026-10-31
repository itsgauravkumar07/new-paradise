"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Star, Clock, Edit, Trash2, Plus, Eye, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { PACKAGE_CATEGORIES, TOUR_TYPES } from "@/config/categories";
import { Country, State } from "country-state-city";
import type { ICountry, IState } from "country-state-city";

interface PopularDestination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  location: string;
  country: string;
  state?: string;
  tourType: string;
  category: string;
  rating: number;
  price: number;
  duration: string;
  highlights: string[];
  isActive: boolean;
  isTrending: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

const AdminPopularDestinations = () => {
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState<PopularDestination | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<PopularDestination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Country and state management
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [states, setStates] = useState<Array<{ name: string; state_code: string }>>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  // Image handling - same as trending destinations
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    location: "",
    country: "",
    state: "",
    tourType: "",
    category: "Popular Packages",
    rating: "",
    price: "",
    duration: "",
    highlights: "",
    isActive: true,
    isTrending: false
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

  // Image handling functions - same as trending
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

  const fetchPopularDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers: HeadersInit = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/destinations?limit=100', { 
        headers,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch destinations' }));
        throw new Error(errorData.message || 'Failed to fetch popular destinations');
      }

      const data = await response.json();
      
      let destinationsArray: PopularDestination[] = [];
      
      if (Array.isArray(data)) {
        destinationsArray = data;
      } else if (data.destinations && Array.isArray(data.destinations)) {
        destinationsArray = data.destinations;
      } else {
        console.warn('Unexpected data format:', data);
        destinationsArray = [];
      }

      setPopularDestinations(destinationsArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching destinations';
      setError(errorMessage);
      console.error('Fetch destinations error:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularDestinations();
  }, []);

  const handleAddDestination = async () => {
    try {
      // Validation
      if (!formData.name?.trim()) {
        toast.error('Destination name is required');
        return;
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
        toast.error('Location is required');
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
      if (!formData.category) {
        toast.error('Category is required');
        return;
      }
      if (!imagePreview && !imageFile) {
        toast.error('Please select a destination image');
        return;
      }

      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setSubmitting(false);
        return;
      }

      console.log('🔥 Creating destination with upload method:', uploadMethod);

      // If using URL method (no file upload)
      if (uploadMethod === 'url' && imageUrl && !imageFile) {
        console.log('📝 Using image URL:', imageUrl);
        
        const destinationData = {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim(),
          shortDescription: formData.shortDescription.trim(),
          image: imageUrl,
          location: formData.location.trim(),
          country: formData.country.trim(),
          state: formData.state?.trim() || '',
          tourType: formData.tourType,
          category: formData.category,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          price: formData.price ? parseFloat(formData.price) : 0,
          duration: formData.duration?.trim() || '',
          highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()).filter(h => h) : [],
          isActive: formData.isActive,
          isTrending: formData.isTrending
        };

        console.log('📤 Sending JSON data to API');

        const response = await fetch('/api/destinations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(destinationData),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to create destination';
          
          try {
            const errorData = await response.json();
            console.error('❌ Server error:', errorData);
            
            // Handle different error response formats
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (Object.keys(errorData).length > 0) {
              // If errorData has properties but no message, try to extract useful info
              errorMessage = JSON.stringify(errorData);
            } else {
              // Empty object or no useful data, use status text
              errorMessage = response.statusText || `Server returned ${response.status} status`;
            }
          } catch (jsonError) {
            // If JSON parsing fails, try to get text
            try {
              const errorText = await response.text();
              errorMessage = errorText || response.statusText || `Server returned ${response.status} status`;
            } catch (textError) {
              errorMessage = response.statusText || `Server returned ${response.status} status`;
            }
            console.error('❌ Failed to parse error response:', jsonError);
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Destination created successfully:', result);

        await fetchPopularDestinations();
        resetForm();
        toast.success('Popular destination added successfully!');
        return;
      }

      // If using file upload
      if (imageFile) {
        console.log('📁 Uploading file:', imageFile.name);
        
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        uploadFormData.append('name', formData.name.trim());
        if (formData.slug.trim()) {
          uploadFormData.append('slug', formData.slug.trim());
        }
        uploadFormData.append('description', formData.description.trim());
        uploadFormData.append('shortDescription', formData.shortDescription.trim());
        uploadFormData.append('location', formData.location.trim());
        uploadFormData.append('country', formData.country.trim());
        if (formData.state?.trim()) {
          uploadFormData.append('state', formData.state.trim());
        }
        uploadFormData.append('tourType', formData.tourType);
        uploadFormData.append('category', formData.category);
        uploadFormData.append('rating', formData.rating || '0');
        uploadFormData.append('price', formData.price || '0');
        if (formData.duration?.trim()) {
          uploadFormData.append('duration', formData.duration.trim());
        }
        if (formData.highlights.trim()) {
          uploadFormData.append('highlights', formData.highlights.trim());
        }
        uploadFormData.append('isActive', String(formData.isActive));
        uploadFormData.append('isTrending', String(formData.isTrending));

        console.log('📤 Sending FormData to API');

        const response = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          let errorMessage = 'Failed to create destination';
          
          try {
            const errorData = await response.json();
            console.error('❌ Server error:', errorData);
            
            // Handle different error response formats
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (Object.keys(errorData).length > 0) {
              // If errorData has properties but no message, try to extract useful info
              errorMessage = JSON.stringify(errorData);
            } else {
              // Empty object or no useful data, use status text
              errorMessage = response.statusText || `Server returned ${response.status} status`;
            }
          } catch (jsonError) {
            // If JSON parsing fails, try to get text
            try {
              const errorText = await response.text();
              errorMessage = errorText || response.statusText || `Server returned ${response.status} status`;
            } catch (textError) {
              errorMessage = response.statusText || `Server returned ${response.status} status`;
            }
            console.error('❌ Failed to parse error response:', jsonError);
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Destination created successfully:', result);

        await fetchPopularDestinations();
        resetForm();
        toast.success('Popular destination added successfully!');
      } else {
        toast.error('Please select an image');
        setSubmitting(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create destination';
      console.error('❌ Create destination error:', err);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDestination = async () => {
    if (!editingDestination) return;

    try {
      // Validation
      if (!formData.name?.trim()) {
        toast.error('Destination name is required');
        return;
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
        toast.error('Location is required');
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
      if (!formData.category) {
        toast.error('Category is required');
        return;
      }

      setSubmitting(true);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setSubmitting(false);
        return;
      }

      console.log('🔥 Updating destination with upload method:', uploadMethod);

      // If using URL method and no new file
      if (uploadMethod === 'url' && imageUrl && !imageFile) {
        console.log('📝 Using image URL:', imageUrl);
        
        const destinationData = {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim(),
          shortDescription: formData.shortDescription.trim(),
          image: imageUrl,
          location: formData.location.trim(),
          country: formData.country.trim(),
          state: formData.state?.trim() || '',
          tourType: formData.tourType,
          category: formData.category,
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          price: formData.price ? parseFloat(formData.price) : 0,
          duration: formData.duration?.trim() || '',
          highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()).filter(h => h) : [],
          isActive: formData.isActive,
          isTrending: formData.isTrending
        };

        const response = await fetch(`/api/destinations/${editingDestination._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(destinationData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: 'Failed to update destination' 
          }));
          console.error('❌ Server error:', errorData);
          throw new Error(errorData.message || 'Failed to update destination');
        }

        const result = await response.json();
        console.log('✅ Destination updated successfully:', result);

        await fetchPopularDestinations();
        setEditingDestination(null);
        resetForm();
        toast.success('Popular destination updated successfully!');
        return;
      }

      // If using file upload
      const uploadFormData = new FormData();
      
      if (imageFile) {
        console.log('📁 Uploading new file:', imageFile.name);
        uploadFormData.append('image', imageFile);
      }
      
      uploadFormData.append('name', formData.name.trim());
      if (formData.slug.trim()) {
        uploadFormData.append('slug', formData.slug.trim());
      }
      uploadFormData.append('description', formData.description.trim());
      uploadFormData.append('shortDescription', formData.shortDescription.trim());
      uploadFormData.append('location', formData.location.trim());
      uploadFormData.append('country', formData.country.trim());
      if (formData.state?.trim()) {
        uploadFormData.append('state', formData.state.trim());
      }
      uploadFormData.append('tourType', formData.tourType);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('rating', formData.rating || '0');
      uploadFormData.append('price', formData.price || '0');
      if (formData.duration?.trim()) {
        uploadFormData.append('duration', formData.duration.trim());
      }
      if (formData.highlights.trim()) {
        uploadFormData.append('highlights', formData.highlights.trim());
      }
      uploadFormData.append('isActive', String(formData.isActive));
      uploadFormData.append('isTrending', String(formData.isTrending));

      console.log('📤 Sending update to API');

      const response = await fetch(`/api/destinations/${editingDestination._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      console.log('📥 Update response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to update destination';
        
        try {
          const errorData = await response.json();
          console.error('❌ Server error:', errorData);
          
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (Object.keys(errorData).length > 0) {
            // If errorData has properties but no message, try to extract useful info
            errorMessage = JSON.stringify(errorData);
          } else {
            // Empty object or no useful data, use status text
            errorMessage = response.statusText || `Server returned ${response.status} status`;
          }
        } catch (jsonError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || response.statusText || `Server returned ${response.status} status`;
          } catch (textError) {
            errorMessage = response.statusText || `Server returned ${response.status} status`;
          }
          console.error('❌ Failed to parse error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Destination updated successfully:', result);

      await fetchPopularDestinations();
      setEditingDestination(null);
      resetForm();
      toast.success('Popular destination updated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update destination';
      console.error('❌ Update destination error:', err);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDestination = (dest: PopularDestination) => {
    setEditingDestination(dest);

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

    // Set existing image
    const existingImage = dest.image || '';
    setImagePreview(existingImage);
    setImageUrl(existingImage);
    setUploadMethod('url');
    setImageFile(null);

    setFormData({
      name: dest.name,
      slug: dest.slug,
      description: dest.description,
      shortDescription: dest.shortDescription,
      location: dest.location,
      country: dest.country,
      state: dest.state || "",
      tourType: dest.tourType,
      category: dest.category,
      rating: dest.rating.toString(),
      price: dest.price.toString(),
      duration: dest.duration,
      highlights: dest.highlights.join(', '),
      isActive: dest.isActive,
      isTrending: dest.isTrending || false
    });
    setShowAddForm(true);
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

      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete destination';
        
        try {
          const errorData = await response.json();
          console.error('❌ Server error:', errorData);
          
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (Object.keys(errorData).length > 0) {
            errorMessage = JSON.stringify(errorData);
          } else {
            errorMessage = response.statusText || `Server returned ${response.status} status`;
          }
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || response.statusText || `Server returned ${response.status} status`;
          } catch (textError) {
            errorMessage = response.statusText || `Server returned ${response.status} status`;
          }
          console.error('❌ Failed to parse error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }

      toast.success('Destination deleted successfully!');
      await fetchPopularDestinations();

      setTimeout(() => {
        const newTotalPages = Math.ceil((popularDestinations.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete destination';
      console.error('Delete destination error:', err);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // const toggleDestinationStatus = async (dest: PopularDestination) => {
  //   try {
  //     setSubmitting(true);

  //     const token = localStorage.getItem('adminToken');
  //     if (!token) {
  //       toast.error('Authentication required. Please login again.');
  //       return;
  //     }

  //     const uploadFormData = new FormData();
  //     uploadFormData.append('isActive', String(!dest.isActive));

  //     const response = await fetch(`/api/destinations/${dest._id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: uploadFormData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Status update failed');
  //     }

  //     await fetchPopularDestinations();
  //     toast.success('Status updated successfully!');
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : 'Failed to update destination status';
  //     console.error('Toggle status error:', err);
  //     toast.error(errorMessage);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const toggleDestinationStatus = async (dest: PopularDestination) => {
  try {
    setSubmitting(true);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Authentication required. Please login again.');
      return;
    }

    // ✅ FIX: Send as JSON instead of FormData
    const response = await fetch(`/api/destinations/${dest._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json', // ← Add this header
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        isActive: !dest.isActive
      }),
    });

    if (!response.ok) {
      throw new Error('Status update failed');
    }

    await fetchPopularDestinations();
    toast.success('Status updated successfully!');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update destination status';
    console.error('Toggle status error:', err);
    toast.error(errorMessage);
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
      location: "",
      country: "",
      state: "",
      tourType: "",
      category: "Popular Packages",
      rating: "",
      price: "",
      duration: "",
      highlights: "",
      isActive: true,
      isTrending: false
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

  const totalPages = Math.ceil(popularDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDestinations = popularDestinations.slice(startIndex, endIndex);

  const handlePrevious = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const handlePageChange = (page: number) => setCurrentPage(page);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading popular destinations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-purple-600" />
            Popular Destinations
          </h1>
          <p className="text-gray-600">Manage your popular travel destinations and trending places.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Popular Destination
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => {
              setError(null);
              fetchPopularDestinations();
            }}
            className="text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            {editingDestination ? "Edit Popular Destination" : "Add New Popular Destination"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Manali"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (Optional)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., manali (auto-generated if empty)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Himachal Pradesh, India"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Type <span className="text-red-500">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
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
                placeholder="e.g., 3 Days"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 15000"
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
                placeholder="e.g., 4.8"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Trending</label>
              <select
                value={formData.isTrending ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.value === "true" })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Image Upload Section - Same as Trending */}
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadMethod === 'file'
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadMethod === 'url'
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
                    alt="Preview"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the destination..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-gray-900 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Enter detailed destination description..."
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
                placeholder="e.g., Solang Valley, Hadimba Temple, Rohtang Pass"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={editingDestination ? handleUpdateDestination : handleAddDestination}
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingDestination ? "Update Destination" : "Add Destination"}
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
              <p className="!text-purple-100">Total Destinations</p>
              <p className="text-2xl !text-white font-bold">{popularDestinations.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-green-100">Active Destinations</p>
              <p className="text-2xl !text-white font-bold">{popularDestinations.filter(d => d.isActive).length}</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-blue-100">Trending Destinations</p>
              <p className="text-2xl !text-white font-bold">{popularDestinations.filter(d => d.isTrending).length}</p>
            </div>
            <Star className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="!text-yellow-100">Avg Rating</p>
              <p className="text-2xl !text-white font-bold">
                {popularDestinations.length > 0
                  ? (popularDestinations.reduce((sum, d) => sum + d.rating, 0) / popularDestinations.length).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Popular Destinations</h2>
        </div>
        {popularDestinations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No popular destinations found. Add your first popular destination to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
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
                {paginatedDestinations.map((dest) => (
                  <tr key={dest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden relative flex-shrink-0">
                          <Image
                            src={dest.image || "https://via.placeholder.com/48"}
                            alt={dest.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dest.name}</div>
                          <div className="text-xs text-gray-500">{dest.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.state || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.tourType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dest.duration || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      ₹{dest.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{dest.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleDestinationStatus(dest)}
                        disabled={submitting}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          dest.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dest.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedDestination(dest)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditDestination(dest)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(dest._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Pagination */}
      {popularDestinations.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, popularDestinations.length)} of {popularDestinations.length} destinations
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

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

      {/* Destination Details Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Destination Details</h3>
              <button
                onClick={() => setSelectedDestination(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="w-full h-64 rounded-lg overflow-hidden relative">
                <Image
                  src={selectedDestination.image || "https://via.placeholder.com/600x400"}
                  alt={selectedDestination.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-gray-900">{selectedDestination.name}</h4>
                <p className="text-gray-600 mt-2">{selectedDestination.shortDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Location</span>
                  <p className="text-gray-900">{selectedDestination.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Country</span>
                  <p className="text-gray-900">{selectedDestination.country}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">State</span>
                  <p className="text-gray-900">{selectedDestination.state || "—"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Category</span>
                  <p className="text-gray-900">{selectedDestination.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Tour Type</span>
                  <p className="text-gray-900">{selectedDestination.tourType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Duration</span>
                  <p className="text-gray-900">{selectedDestination.duration || "—"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Price</span>
                  <p className="text-gray-900 font-semibold">₹{selectedDestination.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Rating</span>
                  <p className="text-gray-900">{selectedDestination.rating.toFixed(1)} ★</p>
                </div>
              </div>

              {selectedDestination.highlights?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Highlights</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.highlights.map((highlight, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full"
                      >
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

export default AdminPopularDestinations;
