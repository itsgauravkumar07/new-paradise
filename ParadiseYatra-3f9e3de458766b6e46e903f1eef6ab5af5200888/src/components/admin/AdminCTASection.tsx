"use client";

import { useState, useEffect } from "react";
import { } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import {toast} from "react-toastify"

interface CTAContent {
  _id?: string;
  title: string;
  description: string;
  backgroundImage: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

const AdminCTASection = () => {
  const [ctaContent, setCTAContent] = useState<CTAContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CTAContent>({
    title: "",
    description: "",
    backgroundImage: "",
    buttonText: "",
    buttonLink: "",
    isActive: true
  });

  useEffect(() => {
    fetchCTAContent();
  }, []);

  const fetchCTAContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cta');
      if (response.ok) {
        const data = await response.json();
        setCTAContent(data);
        setFormData(data);
      }
    } catch (error) {
      toast.error("Failed to fetch CTA content");
      console.error('Error fetching CTA content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = ctaContent?._id ? 'PUT' : 'POST';
      const url = ctaContent?._id ? `/api/cta/${ctaContent._id}` : '/api/cta';
      
      // Get the admin token from localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error("Please log in to save changes");
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
        await fetchCTAContent();
        setEditing(false);
        toast.success("CTA content saved successfully!");
      } else {
        console.error('Failed to save CTA content:', data.message);
        toast.error(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving CTA content:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData(ctaContent || {
      title: "",
      description: "",
      backgroundImage: "",
      buttonText: "",
      buttonLink: "",
      isActive: true
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(ctaContent || {
      title: "",
      description: "",
      backgroundImage: "",
      buttonText: "",
      buttonLink: "",
      isActive: true
    });
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
          <h2 className="text-2xl font-bold text-gray-900">CTA Section Management</h2>
          <p className="text-gray-600">Manage the call-to-action section content</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit} variant="admin-primary" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit CTA Content
          </Button>
        )}
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit CTA Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ready for Your Next Adventure?"
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Join thousands of travelers who trust Paradise Yatra for their dream vacations."
                rows={3}
                className="bg-white"
              />
            </div>

            <div>
              <ImageUpload
                value={formData.backgroundImage}
                onChange={(value) => setFormData(prev => ({ ...prev, backgroundImage: value }))}
                label="Background Image"
                contentType="cta"
                
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div> 
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <Input
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  placeholder="Start Your Journey"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <Input
                  value={formData.buttonLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                  placeholder="/packages"
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
            <CardTitle>Current CTA Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900 font-medium">{ctaContent?.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{ctaContent?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Button Text</label>
                  <p className="text-gray-900">{ctaContent?.buttonText}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Button Link</label>
                  <p className="text-gray-900">{ctaContent?.buttonLink}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Background Image</label>
                <p className="text-gray-900 text-sm break-all">{ctaContent?.backgroundImage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCTASection; 