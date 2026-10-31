"use client";

import { useState, useEffect } from "react";
import { } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus, Trash2, Star } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import ImageUpload from "@/components/ui/image-upload";
import { getImageUrl } from "@/lib/utils";

interface Testimonial {
  _id?: string;
  name: string;
  location: string;
  rating: number;
   image: string;
  text: string;
  package: string;
  date: string;
  verified: boolean;
  featured: boolean;
  isActive: boolean;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<Testimonial>({ 
    name: "",
    location: "",
    rating: 5,
    image: "",
    text: "",
    package: "",
    date: "",
    verified: true,
    featured: false,
    isActive: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/testimonials/${editing}` : '/api/testimonials';
      
      // Get the admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please log in to save changes');
        return;
      }

      // Check if we need to upload a file
      const hasFileUpload = formData.image && (formData.image.startsWith('blob:') || formData.image.startsWith('data:'));
      
      let response;
      if (hasFileUpload) {
        // Handle file upload
        const uploadFormData = new FormData();
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
          const value = (formData as unknown as Record<string, unknown>)[key];
          if (key === 'image' && typeof value === 'string' && value.startsWith('blob:')) {
            // Convert blob URL to file and upload
            fetch(value)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                uploadFormData.append('image', file);
              });
          } else if (key === 'image' && typeof value === 'string' && value.startsWith('data:')) {
            // Convert data URL to file and upload
            const response = fetch(value);
            response.then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                uploadFormData.append('image', file);
              });
          } else {
            uploadFormData.append(key, String(value));
          }
        });

        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
      } else {
        // Handle regular JSON data
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        await fetchTestimonials();
        setEditing(null);
        setShowAddForm(false);
        resetForm();
        toast.success(editing ? 'Testimonial updated successfully!' : 'Testimonial added successfully!');
      } else {
        console.error('Failed to save testimonial:', data.message);
        toast.error(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditing(testimonial._id || '');
    setFormData(testimonial);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        // Get the admin token from localStorage
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          toast.error('Please log in to delete testimonials');
          return;
        }
        
        const response = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          await fetchTestimonials();
          toast.success('Testimonial deleted successfully!');
        } else {
          console.error('Failed to delete testimonial:', data.message);
          toast.error(`Failed to delete: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Network error. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      rating: 5,
      image: "",
      text: "",
      package: "",
      date: "",
      verified: true,
      featured: false,
      isActive: true
    });
  };

  const handleAddNew = () => {
    setEditing(null);
    setShowAddForm(true);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimonials Management</h2>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <Button onClick={handleAddNew} variant="admin-primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Testimonial
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Mumbai, India"
                  className="text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className={`p-1 ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{formData.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name
                </label>
                <Input
                  value={formData.package}
                  onChange={(e) => setFormData(prev => ({ ...prev, package: e.target.value }))}
                  placeholder="Bali Paradise Package"
                  className="text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testimonial Text
              </label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience..."
                rows={4}
                className="text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  label="Profile Image"
                  contentType="testimonials"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="2024-01-15"
                  className="text-white"
                  />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Verified Customer</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                variant="admin-primary"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Testimonial'}
              </Button>
              <Button variant="admin-outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial._id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative">
                    {getImageUrl(testimonial.image) ? (
                      <Image 
                        src={getImageUrl(testimonial.image)!} 
                        alt={testimonial.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="w-6 h-6 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-xs">No image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.text}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Package:</strong> {testimonial.package}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {testimonial.date}
                </p>
                <div className="flex gap-2">
                  {testimonial.verified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                  {testimonial.featured && (
                    <Badge variant="default" className="text-xs">Featured</Badge>
                  )}
                  {!testimonial.isActive && (
                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                  )}
                </div>
              </div>
                                  <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="admin-outline"
                        onClick={() => handleEdit(testimonial)}
                        className="flex items-center gap-1 text-gray-900"
                      >
                        <Edit className="w-3 h-3 text-gray-900" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="admin-secondary"
                        onClick={() => testimonial._id && handleDelete(testimonial._id)}
                        className="flex items-center gap-1 text-gray-900"
                      >
                        <Trash2 className="w-3 h-3 text-gray-900" />
                        Delete
                      </Button>
                    </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials; 