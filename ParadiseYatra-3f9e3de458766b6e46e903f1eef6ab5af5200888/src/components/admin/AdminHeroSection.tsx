"use client";

import { useState, useEffect } from "react";
import { } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Plus } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { toast } from "react-toastify";


interface HeroContent {
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  trustBadgeText: string;
  popularDestinations: string[];
  ctaButtonText: string;
  secondaryButtonText: string;
  isActive: boolean;
}

const AdminHeroSection = () => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<HeroContent>({
    title: "",
    subtitle: "",
    description: "",
    backgroundImage: "",
    trustBadgeText: "",
    popularDestinations: [],
    ctaButtonText: "",
    secondaryButtonText: "",
    isActive: true
  });

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hero');
      if (response.ok) {
        const data = await response.json();
        setHeroContent(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = heroContent?._id ? 'PUT' : 'POST';
      const url = heroContent?._id ? `/api/hero/${heroContent._id}` : '/api/hero';
      
      // Get the admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Please log in to save changes');
        return;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchHeroContent();
        setEditing(false);
        toast.success('Hero content saved successfully!');
      } else {
        console.error('Failed to save hero content:', data.message);
        toast.error(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData(heroContent || {
      title: "",
      subtitle: "",
      description: "",
      backgroundImage: "",
      trustBadgeText: "",
      popularDestinations: [],
      ctaButtonText: "",
      secondaryButtonText: "",
      isActive: true
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(heroContent || {
      title: "",
      subtitle: "",
      description: "",
      backgroundImage: "",
      trustBadgeText: "",
      popularDestinations: [],
      ctaButtonText: "",
      secondaryButtonText: "",
      isActive: true
    });
  };

  const addDestination = () => {
    setFormData(prev => ({
      ...prev,
      popularDestinations: [...prev.popularDestinations, ""]
    }));
  };

  const updateDestination = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      popularDestinations: prev.popularDestinations.map((dest, i) => 
        i === index ? value : dest
      )
    }));
  };

  const removeDestination = (index: number) => {
    setFormData(prev => ({
      ...prev,
      popularDestinations: prev.popularDestinations.filter((_, i) => i !== index)
    }));
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
          <h2 className="text-2xl font-bold text-gray-900">Hero Section Management</h2>
          <p className="text-gray-600">Manage the main hero section content</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Hero Content
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Your Next Adventure Awaits"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Unforgettable journeys, handpicked for you"
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explore, dream, and discover with Paradise Yatra."
                rows={3}
                className="bg-white"
              />
            </div>

            <div>
              <ImageUpload
                value={formData.backgroundImage}
                onChange={(value) => setFormData(prev => ({ ...prev, backgroundImage: value }))}
                label="Background Image"
                contentType="hero"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trust Badge Text
              </label>
              <Input
                value={formData.trustBadgeText}
                onChange={(e) => setFormData(prev => ({ ...prev, trustBadgeText: e.target.value }))}
                placeholder="Trusted by 5000+ travelers"
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popular Destinations
              </label>
              <div className="space-y-2">
                {formData.popularDestinations.map((dest, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={dest}
                      onChange={(e) => updateDestination(index, e.target.value)}
                      placeholder="Destination name"
                      className="bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDestination(index)}
                      className="bg-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDestination}
                  className="flex items-center gap-2 bg-white"
                >
                  <Plus className="w-4 h-4 " />
                  Add Destination
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Button Text
                </label>
                <Input
                  value={formData.ctaButtonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                  placeholder="Explore Packages"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Button Text
                </label>
                <Input
                  value={formData.secondaryButtonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                  placeholder="Watch Video"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                variant="admin-primary"
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
                <Button variant="admin-outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Hero Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Title</label>
                  <p className="text-gray-900 font-medium">{heroContent?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Subtitle</label>
                  <p className="text-gray-900 font-medium">{heroContent?.subtitle}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{heroContent?.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Trust Badge</label>
                <p className="text-gray-900">{heroContent?.trustBadgeText}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Popular Destinations</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {heroContent?.popularDestinations.map((dest, index) => (
                    <Badge key={index} variant="secondary">{dest}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">CTA Button</label>
                  <p className="text-gray-900">{heroContent?.ctaButtonText}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Secondary Button</label>
                  <p className="text-gray-900">{heroContent?.secondaryButtonText}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Background Image</label>
                <p className="text-gray-900 text-sm break-all">{heroContent?.backgroundImage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHeroSection; 