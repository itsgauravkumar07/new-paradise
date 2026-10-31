"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2, MapPin, Package, Star, ImageIcon, Search, Calendar, Users, Upload } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import { useLocations } from "@/hooks/useLocations";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface FixedDeparture {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  destination: string;
  duration: string;
  country: string;
  state?: string;
  tourType: 'international' | 'india';
  category: string;
  departureDate: string;
  returnDate: string;
  availableSeats: number;
  totalSeats: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  departures?: { date: string; price: number; seats: number; status: 'available' | 'soldout' }[];
}

const AdminFixedDepartures = () => {
  const [fixedDepartures, setFixedDepartures] = useState<FixedDeparture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Use locations hook for dynamic data
  const { countries, states, loading: locationsLoading, fetchStates, clearStates } = useLocations();

  // Add state for storing country ISO2 and state code
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");



  // Transform countries for dropdown
  const countryOptions = countries.map(country => ({
    value: country.iso2,
    label: `${country.emoji} ${country.name}`
  }));

  // Transform states for dropdown
  const stateOptions = states.map(state => ({
    value: state.state_code,
    label: state.name
  }));

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryIso2 = e.target.value;
    setSelectedCountryIso2(countryIso2);
    setFormData(prev => ({ ...prev, country: countryIso2, state: '' }));
    setSelectedStateCode('');

    if (countryIso2) {
      fetchStates(countryIso2);
    } else {
      clearStates();
    }
  };

  // Handle state change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);
    setFormData(prev => ({ ...prev, state: stateCode }));
  };

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    discount: '0',
    destination: '',
    duration: '',
    country: '',
    state: '',
    tourType: '' as 'international' | 'india' | '',
    category: 'Fixed Departure',
    departureDate: '',
    returnDate: '',
    availableSeats: '',
    totalSeats: '',
    images: [] as string[],
    isActive: true,
    isFeatured: false,
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    departures: [] as { date: string; price: number; seats: number; status: 'available' | 'soldout' }[]
  });

  useEffect(() => {
    fetchFixedDepartures();
  }, []);

  const fetchFixedDepartures = async () => {
    try {
      const response = await fetch('/api/fixed-departures', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setFixedDepartures(data.fixedDepartures || []);
      }
    } catch (error) {
      console.error('Error fetching fixed departures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/fixed-departures/${editingId}`
        : '/api/fixed-departures';

      const method = editingId ? 'PUT' : 'POST';

      // Convert ISO codes to actual names for submission
      let countryName = formData.country;
      let stateName = formData.state;

      if (selectedCountryIso2) {
        const selectedCountry = countries.find(c => c.iso2 === selectedCountryIso2);
        countryName = selectedCountry ? selectedCountry.name : selectedCountryIso2;
      }
      if (selectedStateCode) {
        const selectedState = states.find(s => s.state_code === selectedStateCode);
        stateName = selectedState ? selectedState.name : selectedStateCode;
      }

      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        destination: formData.destination,
        duration: formData.duration,
        country: countryName,
        state: stateName,
        tourType: formData.tourType,
        category: formData.category,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        images: formData.images,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        status: formData.status,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: parseFloat(formData.discount || '0'),
        availableSeats: parseInt(formData.availableSeats) || 0,
        totalSeats: parseInt(formData.totalSeats) || 0,
        departures: formData.departures
      };

      console.log('Submitting fixed departure:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchFixedDepartures();
        toast.success('Fixed departure saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', errorData);
        toast.error(errorData.message || 'Failed to save fixed departure');
      }
    } catch (error: any) {
      console.error('Error saving fixed departure:', error);
      toast.error(`Error: ${error.message || 'Failed to save fixed departure'}`);
    }
  };

  const handleEdit = (departure: FixedDeparture) => {
    // Find country ISO2 and state code from names
    const country = countries.find(c => c.name === departure.country);
    const state = states.find(s => s.name === departure.state);

    setSelectedCountryIso2(country?.iso2 || '');
    setSelectedStateCode(state?.state_code || '');

    // If country is found, fetch its states
    if (country?.iso2) {
      fetchStates(country.iso2);
    }

    setFormData({
      title: departure.title,
      slug: departure.slug,
      description: departure.description,
      shortDescription: departure.shortDescription,
      price: departure.price.toString(),
      originalPrice: departure.originalPrice?.toString() || '',
      discount: departure.discount?.toString() || '0',
      destination: departure.destination,
      duration: departure.duration || '',
      country: departure.country || '',
      state: departure.state || '',
      tourType: departure.tourType || '',
      category: departure.category || '',
      departureDate: departure.departureDate.split('T')[0],
      returnDate: departure.returnDate.split('T')[0],
      availableSeats: departure.availableSeats.toString(),
      totalSeats: departure.totalSeats.toString(),
      images: departure.images || [],
      isActive: departure.isActive,
      isFeatured: departure.isFeatured,
      status: departure.status,
      departures: departure.departures || []
    });
    setEditingId(departure._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/fixed-departures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        fetchFixedDepartures();
        toast.success('Fixed departure deleted successfully');
      } else {
        toast.error('Failed to delete fixed departure');
      }
    } catch (error) {
      console.error('Error deleting fixed departure:', error);
      toast.error('Failed to delete fixed departure');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      discount: '0',
      destination: '',
      duration: '',
      country: '',
      state: '',
      tourType: '',
      category: 'Fixed Departure',
      departureDate: '',
      returnDate: '',
      availableSeats: '',
      totalSeats: '',
      images: [],
      isActive: true,
      isFeatured: false,
      status: 'upcoming',
      departures: []
    });
    setSelectedCountryIso2('');
    setSelectedStateCode('');
    clearStates();
  };

  const filteredFixedDepartures = fixedDepartures.filter(departure =>
    departure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departure.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departure.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (departure.state && departure.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
    departure.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departure.tourType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('image', files[i]);
      }
      // Add contentType for Cloudinary folder organization
      formData.append('contentType', 'fixed-departure');

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();


        // Handle different response formats from backend
        let newImages: string[] = [];
        if (data.images && Array.isArray(data.images)) {
          newImages = data.images;
        } else if (data.imageUrl) {
          // Backend returns imageUrl with full URL
          newImages = [data.imageUrl];
        } else if (data.image) {
          newImages = [data.image];
        } else if (data.url) {
          newImages = [data.url];
        } else if (data.filename) {
          // If backend returns just filename, construct full URL
          newImages = [`/api/uploaded-images/uploads/${data.filename}`];
        }



        if (newImages.length > 0) {
          setFormData(prev => {
            const updatedImages = [...prev.images, ...newImages];

            return {
              ...prev,
              images: updatedImages
            };
          });
          toast.success('Images uploaded successfully');
        } else {
          toast.error('No image URLs received from server');
        }
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData); // Debug log
        toast.error('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };



  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addDeparture = () => {
    setFormData(prev => ({
      ...prev,
      departures: [...prev.departures, { date: '', price: parseFloat(prev.price) || 0, seats: parseInt(prev.totalSeats) || 0, status: 'available' }]
    }));
  };

  const removeDeparture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      departures: prev.departures.filter((_, i) => i !== index)
    }));
  };

  const updateDeparture = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      departures: prev.departures.map((d, i) => i === index ? { ...d, [field]: value } : d)
    }));
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fixed Departures</h1>
        <Button onClick={() => {
          setShowForm(true);
          resetForm();
        }} className="bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Add Fixed Departure
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFixedDepartures.map((departure) => (
          <Card key={departure._id} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{departure.title}</h3>
                <Badge className={getStatusColor(departure.status)}>
                  {departure.status}
                </Badge>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {departure.destination}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {departure.country}
                </span>
                {departure.state && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">
                    {departure.state}
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {departure.category}
                </span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">
                  {departure.tourType}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(departure.departureDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                {departure.departures && departure.departures.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px]">
                    +{departure.departures.length} Batches
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {departure.availableSeats}/{departure.totalSeats}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{departure.price.toLocaleString()}
                </div>
              </div>

              {/* Display Images */}
              {departure.images && departure.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {departure.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="w-16 h-12 bg-gray-50 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={getImageUrl(image) || ''}
                        alt={`${departure.title} image ${index + 1}`}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/100x100/f3f4f6/9ca3af?text=Err";
                        }}
                      />
                    </div>
                  ))}
                  {departure.images.length > 3 && (
                    <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      +{departure.images.length - 3}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm" variant="outline" onClick={() => handleEdit(departure)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" size="sm" variant="outline" onClick={() => setDeleteId(departure._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Fixed Departure' : 'Add New Fixed Departure'}
                </h2>
                <Button variant="ghost" onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}>
                  <X className="w-5 h-5 text-gray-900" />
                </Button>
              </div>

              {locationsLoading && countries.length === 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-800">Loading countries...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Title *</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Slug *</label>
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Destination *</label>
                    <Input
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Duration *</label>
                    <Input
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 5 Days 4 Nights"
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Price *</label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Original Price</label>
                    <Input
                      name="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Discount (%)</label>
                    <Input
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleChange}
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Country *</label>
                    <select
                      name="country"
                      value={selectedCountryIso2}
                      onChange={handleCountryChange}
                      required
                      disabled={locationsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">{locationsLoading ? 'Loading countries...' : 'Select Country *'}</option>
                      {countryOptions.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">State (Optional)</label>
                    <select
                      name="state"
                      value={selectedStateCode}
                      onChange={handleStateChange}
                      disabled={!selectedCountryIso2 || locationsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">{selectedCountryIso2 ? 'Select State' : 'Select a country first'}</option>
                      {stateOptions.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                    {!selectedCountryIso2 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Select a country first to see available states
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Tour Type *</label>
                    <select
                      name="tourType"
                      value={formData.tourType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select Tour Type *</option>
                      <option value="india">India</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select Category</option>
                      <option value="Beach Holidays">Beach Holidays</option>
                      <option value="Adventure Tours">Adventure Tours</option>
                      <option value="Trending Destinations">Trending Destinations</option>
                      <option value="Premium Packages">Premium Packages</option>
                      <option value="Popular Packages">Popular Packages</option>
                      <option value="Fixed Departure">Fixed Departure</option>
                      <option value="Mountain Treks">Mountain Treks</option>
                      <option value="Wildlife Safaris">Wildlife Safaris</option>
                      <option value="Pilgrimage Tours">Pilgrimage Tours</option>
                      <option value="Honeymoon Packages">Honeymoon Packages</option>
                      <option value="Family Tours">Family Tours</option>
                      <option value="Luxury Tours">Luxury Tours</option>
                      <option value="Budget Tours">Budget Tours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Departure Date *</label>
                    <Input
                      name="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Return Date *</label>
                    <Input
                      name="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Total Seats *</label>
                    <Input
                      name="totalSeats"
                      type="number"
                      value={formData.totalSeats}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm !text-gray-900 font-medium mb-2">Available Seats *</label>
                    <Input
                      name="availableSeats"
                      type="number"
                      value={formData.availableSeats}
                      onChange={handleChange}
                      required
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Multiple Departures Section */}
                <Card className="border-blue-100 bg-blue-50/30">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Available Batch Dates
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={addDeparture}
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Batch
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {formData.departures.map((departure, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white p-3 rounded-md border border-gray-200">
                        <div className="col-span-4">
                          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Date</label>
                          <Input
                            type="date"
                            value={departure.date}
                            onChange={(e) => updateDeparture(index, 'date', e.target.value)}
                            className="h-8 text-xs bg-white text-gray-900"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Price</label>
                          <Input
                            type="number"
                            value={departure.price}
                            onChange={(e) => updateDeparture(index, 'price', parseFloat(e.target.value))}
                            className="h-8 text-xs bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Seats</label>
                          <Input
                            type="number"
                            value={departure.seats}
                            onChange={(e) => updateDeparture(index, 'seats', parseInt(e.target.value))}
                            className="h-8 text-xs bg-gray-50 text-gray-900"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Status</label>
                          <select
                            value={departure.status}
                            onChange={(e) => updateDeparture(index, 'status', e.target.value)}
                            className="w-full h-8 text-xs px-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-900"
                          >
                            <option value="available">Available</option>
                            <option value="soldout">Sold Out</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDeparture(index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {formData.departures.length === 0 && (
                      <div className="text-center py-4 text-xs text-gray-500 italic">
                        No additional batches added yet.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Short Description *</label>
                  <RichTextEditor
                    value={formData.shortDescription}
                    onChange={(value) => setFormData(prev => ({ ...prev, shortDescription: value }))}
                    contentType="packages"
                    className="min-h-[160px]"
                    editorViewportClassName="max-h-[240px]"
                    placeholder="Short summary for cards..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Full Description *</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    contentType="packages"
                    className="min-h-[220px]"
                    editorViewportClassName="max-h-[320px]"
                    placeholder="Complete fixed departure details..."
                  />
                </div>





                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Images</label>
                  <div className="space-y-4">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      Current images array: {JSON.stringify(formData.images)}
                    </div>
                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload images or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>

                    {/* Display Uploaded Images */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-full text-sm text-gray-500 mb-2">
                          Debug: {formData.images.length} images loaded
                        </div>
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="text-xs text-gray-500 mb-1 truncate" title={image}>Image {index + 1}</div>
                            <div className="w-full h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              <Image
                                src={getImageUrl(image) || ''}
                                alt={`Image ${index + 1}`}
                                width={300}
                                height={128}
                                className="w-full h-full object-cover"
                                unoptimized
                                onError={(e) => {
                                  // Fallback to a placeholder icon if image fails
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Image+Load+Error";
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      name="isFeatured"
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900">Featured</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}>
                    <X className="w-5 h-5 text-gray-900" />
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
          }
        }}
        title="Delete Fixed Departure"
        message="Are you sure you want to delete this fixed departure? This action cannot be undone."
      />
    </div>
  );
};

export default AdminFixedDepartures;
