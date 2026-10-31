"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import { getImageUrl } from "@/lib/utils";
import { PACKAGE_CATEGORIES } from "@/config/categories";
import { useLocations } from "@/hooks/useLocations";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  ArrowUp,
  ArrowDown,
  Save,
  X
} from "lucide-react";
import Image from "next/image";

interface HolidayType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  duration: string;
  travelers: string;
  badge: string;
  price: string;
  country: string;
  state: string;
  tourType: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const AdminHolidayTypes = () => {
  const [holidayTypes, setHolidayTypes] = useState<HolidayType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Use locations hook for dynamic data
  const { countries, states, loading: locationsLoading, fetchStates, clearStates } = useLocations();
  
  // Add state for storing country ISO2 and state code
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");
  
  const tourTypes = ['international', 'india'];

  // Transform countries for dropdown
  const countryOptions = countries
    .filter(country => country.iso2 && country.name) // Only include countries with both iso2 and name
    .map(country => ({
      value: country.iso2,
      label: `${country.emoji || '🏳️'} ${country.name}`
    }));

  // Transform states for dropdown
  const stateOptions = states
    .filter(state => state.id && state.name) // Only include states with both id and name
    .map(state => ({
      value: state.id.toString(), // Use id as value since that's what the API returns
      label: state.name
    }));

  // Handle country change
  const handleCountryChange = async (value: string) => {
    // Extract the country name without emoji (remove everything before the first space)
    const countryName = value.replace(/^[^\s]*\s*/, '').trim();
    
    // Find the country by name (without emoji)
    const selectedCountry = countries.find(c => c.name === countryName);
    const countryIso2 = selectedCountry ? selectedCountry.iso2 : '';
    
    setSelectedCountryIso2(countryIso2);
    setFormData(prev => ({ ...prev, country: countryName, state: '' }));
    setSelectedStateCode('');
    
    if (countryIso2) {
      try {
        await fetchStates(countryIso2);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    } else {
      clearStates();
    }
  };

  // Handle state change
  const handleStateChange = (value: string) => {
    // Find the state by name since we're now passing the name as value
    const selectedState = states.find(s => s.name === value);
    const stateId = selectedState ? selectedState.id.toString() : '';
    
    setSelectedStateCode(stateId);
    setFormData(prev => ({ ...prev, state: value }));
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    image: "",
    duration: "",
    travelers: "",
    badge: "",
    price: "",
    country: "",
    state: "",
    tourType: "",
    category: "",
    order: 0
  });

  const fetchHolidayTypes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/holiday-types/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch holiday types");
      }

      const data = await response.json();
      setHolidayTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidayTypes();
  }, []);



  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("No admin token found. Please log in again.");
        return;
      }
      
  

      // Convert ISO codes to actual names for submission
      let countryName = formData.country;
      let stateName = formData.state;
      
      if (selectedCountryIso2) {
        const selectedCountry = countries.find(c => c.iso2 === selectedCountryIso2);
        countryName = selectedCountry ? selectedCountry.name : selectedCountryIso2;
      }
      if (selectedStateCode) {
        const selectedState = states.find(s => s.id.toString() === selectedStateCode);
        stateName = selectedState ? selectedState.name : selectedStateCode;
      }

      // Check if image is already a URL (from ImageUpload component) or needs file upload
      // ImageUpload component uploads to /api/upload/image and returns Cloudinary URL
      const isImageUrl = formData.image && formData.image.startsWith('http');
      const hasBlobDataUrl = formData.image && (formData.image.startsWith('blob:') || formData.image.startsWith('data:'));
      
      let response;
      
      if (hasBlobDataUrl) {
        // Handle blob/data URL - convert to file first
        let file: File;
        try {
          if (formData.image.startsWith('blob:')) {
            const blobResponse = await fetch(formData.image);
            const blob = await blobResponse.blob();
            file = new File([blob], 'holiday-type-image.jpg', { type: blob.type || 'image/jpeg' });
          } else if (formData.image.startsWith('data:')) {
            const blobResponse = await fetch(formData.image);
            const blob = await blobResponse.blob();
            file = new File([blob], 'holiday-type-image.jpg', { type: blob.type || 'image/jpeg' });
          } else {
            throw new Error('Invalid image format');
          }
          
          // Handle file upload
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);
          uploadFormData.append('title', formData.title);
          uploadFormData.append('description', formData.description);
          uploadFormData.append('shortDescription', formData.shortDescription);
          uploadFormData.append('duration', formData.duration || '');
          uploadFormData.append('travelers', formData.travelers || '');
          uploadFormData.append('badge', formData.badge || '');
          uploadFormData.append('price', formData.price || '');
          uploadFormData.append('country', countryName);
          uploadFormData.append('state', stateName || '');
          uploadFormData.append('tourType', formData.tourType || '');
          uploadFormData.append('category', formData.category || '');
          uploadFormData.append('order', String(formData.order || 0));

          response = await fetch("/api/holiday-types", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          });
        } catch (convertError) {
          console.error('Error converting image:', convertError);
          return toast.error("Failed to process image. Please try uploading again.");
        }
      } else {
        // Handle regular JSON data (image is already a URL from ImageUpload component)
        response = await fetch("/api/holiday-types", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            image: formData.image || '',
            country: countryName,
            state: stateName
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create holiday type");
      }

      // Close form and reset before fetching
      setShowCreateForm(false);
      resetForm();
      
      // Refresh the holiday types list
      await fetchHolidayTypes();
      
      toast.success("Holiday type created successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("No admin token found. Please log in again.");
        return;
      }

      // Convert ISO codes to actual names for submission
      let countryName = formData.country;
      let stateName = formData.state;
      
      if (selectedCountryIso2) {
        const selectedCountry = countries.find(c => c.iso2 === selectedCountryIso2);
        countryName = selectedCountry ? selectedCountry.name : selectedCountryIso2;
      }
      if (selectedStateCode) {
        const selectedState = states.find(s => s.id.toString() === selectedStateCode);
        stateName = selectedState ? selectedState.name : selectedStateCode;
      }

      // Check if image changed - need to check if it's a new blob/data URL or URL
      const existingHolidayType = holidayTypes.find(ht => ht._id === id);
      const imageChanged = existingHolidayType && formData.image !== existingHolidayType.image;
      const hasBlobDataUrl = formData.image && (formData.image.startsWith('blob:') || formData.image.startsWith('data:'));
      const isNewImageUrl = formData.image && formData.image.startsWith('http') && imageChanged;
      
      console.log('Update - Existing image:', existingHolidayType?.image);
      console.log('Update - New image:', formData.image);
      console.log('Update - Image changed:', imageChanged);
      console.log('Update - Has blob/data URL:', hasBlobDataUrl);
      console.log('Update - Is new image URL:', isNewImageUrl);
      
      let response;
      
      if (hasBlobDataUrl) {
        // Handle blob/data URL - convert to file first
        let file: File;
        try {
          if (formData.image.startsWith('blob:')) {
            const blobResponse = await fetch(formData.image);
            const blob = await blobResponse.blob();
            file = new File([blob], 'holiday-type-image.jpg', { type: blob.type || 'image/jpeg' });
          } else if (formData.image.startsWith('data:')) {
            const blobResponse = await fetch(formData.image);
            const blob = await blobResponse.blob();
            file = new File([blob], 'holiday-type-image.jpg', { type: blob.type || 'image/jpeg' });
          } else {
            throw new Error('Invalid image format');
          }
          
          // Handle file upload
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);
          uploadFormData.append('title', formData.title);
          uploadFormData.append('description', formData.description);
          uploadFormData.append('shortDescription', formData.shortDescription);
          uploadFormData.append('duration', formData.duration || '');
          uploadFormData.append('travelers', formData.travelers || '');
          uploadFormData.append('badge', formData.badge || '');
          uploadFormData.append('price', formData.price || '');
          uploadFormData.append('country', countryName);
          uploadFormData.append('state', stateName || '');
          uploadFormData.append('tourType', formData.tourType || '');
          uploadFormData.append('category', formData.category || '');
          uploadFormData.append('order', String(formData.order || 0));

          response = await fetch(`/api/holiday-types/${id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadFormData,
          });
        } catch (convertError) {
          console.error('Error converting image:', convertError);
          return toast.error("Failed to process image. Please try uploading again.");
        }
      } else {
        // Handle regular JSON data (image is already a URL from ImageUpload component)
        // Always include the image in the update request, even if it's the same URL
        // The backend will handle whether to update it or not
        const updateData = {
          ...formData,
          image: formData.image || '', // Always include image field
          country: countryName,
          state: stateName
        };
        
        console.log('Update - Sending JSON update with image:', updateData.image);
        
        response = await fetch(`/api/holiday-types/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update holiday type");
      }

      await fetchHolidayTypes();
      setEditingId(null);
      resetForm();
      toast.success("Holiday type updated successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/holiday-types/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete holiday type");
      }

      await fetchHolidayTypes();
      setDeleteId(null);
      toast.success("Holiday type deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/holiday-types/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle status");
      }

      await fetchHolidayTypes();
      toast.success("Holiday type status toggled successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/holiday-types/${id}/toggle-featured`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle featured status");
      }

      await fetchHolidayTypes();
      toast.success("Holiday type featured status toggled successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/holiday-types/${id}/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      await fetchHolidayTypes();
      toast.success("Holiday type order updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      image: "",
      duration: "",
      travelers: "",
      badge: "",
      price: "",
      country: "",
      state: "",
      tourType: "",
      category: "",
      order: 0
    });
    setSelectedCountryIso2("");
    setSelectedStateCode("");
    clearStates();
  };

 const handleEdit = (holidayType: HolidayType) => {
  setEditingId(holidayType._id);
  
  // Find country ISO2 from name
  const country = countries.find(c => c.name === holidayType.country);
  
  if (country?.iso2) {
    setSelectedCountryIso2(country.iso2);
    // Fetch states for this country
    fetchStates(country.iso2);
  } else {
    setSelectedCountryIso2('');
    setSelectedStateCode('');
  }
  
  // Set form data - the state dropdown will update when states are loaded
  setFormData({
    title: holidayType.title,
    description: holidayType.description,
    shortDescription: holidayType.shortDescription,
    image: holidayType.image,
    duration: holidayType.duration,
    travelers: holidayType.travelers,
    badge: holidayType.badge,
    price: holidayType.price,
    country: holidayType.country,
    state: holidayType.state,
    tourType: holidayType.tourType,
    category: holidayType.category,
    order: holidayType.order
  });
};

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Holiday Types Management</h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Holiday Type
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Holiday Type" : "Create New Holiday Type"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Beach Holidays"
                  className="bg-white"
                />
              </div>
              <div>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  label="Holiday Type Image"
                  contentType="holiday-types"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Images will be uploaded to Cloudinary: paradise-yatra/packages/holiday-types
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="5-7 Days"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travelers
                </label>
                <Input
                  value={formData.travelers}
                  onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                  placeholder="2,500+"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge
                </label>
                <Input
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Popular"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <Input
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="From ₹45,000"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Select onValueChange={handleCountryChange} value={formData.country} disabled={locationsLoading}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={locationsLoading ? 'Loading countries...' : 'Select a country'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    {countryOptions.length > 0 ? (
                      countryOptions.map((country, index) => (
                        <SelectItem key={`country-${country.value || index}`} value={country.label}>{country.label}</SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-countries" value="">No countries available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {locationsLoading ? 'Loading countries...' : `${countryOptions.length} countries available`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Select onValueChange={handleStateChange} value={formData.state} disabled={!selectedCountryIso2 || locationsLoading}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={selectedCountryIso2 ? 'Select a state' : 'Select a country first'} />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    {stateOptions.length > 0 ? (
                      stateOptions.map((state, index) => (
                        <SelectItem key={`state-${state.value || index}`} value={state.label}>{state.label}</SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-states" value="">No states available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedCountryIso2 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {locationsLoading ? 'Loading states...' : `${stateOptions.length} states available`}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tour Type
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, tourType: value })} value={formData.tourType}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a tour type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    {tourTypes.map(type => (
                      <SelectItem key={`tour-type-${type}`} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, category: value })} value={formData.category}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    <SelectItem key="category-none" value="">None</SelectItem>
                    {PACKAGE_CATEGORIES.map(category => (
                      <SelectItem key={`category-${category}`} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Discover pristine beaches and crystal-clear waters..."
                rows={2}
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the holiday type..."
                rows={4}
                className="bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Create"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Types List */}
      <div className="grid gap-4">
        {holidayTypes.map((holidayType) => (
          <Card key={holidayType._id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                    {getImageUrl(holidayType.image) ? (
                      <Image 
                        src={getImageUrl(holidayType.image)!} 
                        alt={holidayType.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="w-6 h-6 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-xs">No image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {holidayType.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {holidayType.shortDescription}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant={holidayType.isActive ? "default" : "secondary"}>
                        {holidayType.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {holidayType.isFeatured && (
                        <Badge variant="default" className="bg-yellow-500">
                          Featured
                        </Badge>
                      )}
                      {holidayType.category && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {holidayType.category}
                        </Badge>
                      )}
                      {!holidayType.category && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          No Category
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Order: {holidayType.order}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {holidayType.country && (
                        <span>📍 {holidayType.country}</span>
                      )}
                      {holidayType.state && (
                        <span>🏛️ {holidayType.state}</span>
                      )}
                      {holidayType.tourType && (
                        <span>🎯 {holidayType.tourType}</span>
                      )}
                      {holidayType.category && (
                        <span>🏷️ {holidayType.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(holidayType._id)}
                    title={holidayType.isActive ? "Deactivate" : "Activate"}
                    className="bg-white/80 "
                  >
                    {holidayType.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured(holidayType._id)}
                    title={holidayType.isFeatured ? "Remove from featured" : "Mark as featured"}
                    className="bg-white/80 "
                  >
                    {holidayType.isFeatured ? (
                      <Star className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrder(holidayType._id, holidayType.order - 1)}
                    disabled={holidayType.order === 0}
                    className="bg-white/80 "
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrder(holidayType._id, holidayType.order + 1)}
                    className="bg-white/80 "
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(holidayType)}
                    className="bg-white/80 "
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(holidayType._id)}
                    className="bg-white/80 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Holiday Type"
        message="Are you sure you want to delete this holiday type? This action cannot be undone."
      />
    </div>
  );
};

export default AdminHolidayTypes; 