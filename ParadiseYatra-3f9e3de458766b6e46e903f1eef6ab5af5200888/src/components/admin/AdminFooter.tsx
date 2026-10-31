"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Save, 
  Plus, 
  Edit, 
  Eye, 
  EyeOff, 
  MapPin, 
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  X
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import ConfirmationDialog from "../ui/confirmation-dialog";
import { toast } from "react-toastify";
interface FooterLink {
  name: string;
  href: string;
}

interface SocialMedia {
  platform: string;
  url: string;
  isActive: boolean;
}

interface CompanyInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface FooterContent {
  _id: string;
  companyInfo: CompanyInfo;
  links: {
    international: FooterLink[];
    india: FooterLink[];
    trekking: FooterLink[];
    quickLinks: FooterLink[];
  };
  socialMedia: SocialMedia[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminFooter = () => {
  const [footerContents, setFooterContents] = useState<FooterContent[]>([]);
  const [activeContent, setActiveContent] = useState<FooterContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyInfo: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      whatsapp: ""
    },
    links: {
      international: [{ name: "", href: "" }],
      india: [{ name: "", href: "" }],
      trekking: [{ name: "", href: "" }],
      quickLinks: [{ name: "", href: "" }]
    },
    socialMedia: [
      { platform: "facebook", url: "", isActive: true },
      { platform: "twitter", url: "", isActive: true },
      { platform: "instagram", url: "", isActive: true },
      { platform: "youtube", url: "", isActive: true },
      { platform: "linkedin", url: "", isActive: true }
    ]
  });

  const socialIcons = {
    facebook: Facebook,
    twitter: () => <Image src="/icons8-x-50.png" alt="X (Twitter)" width={20} height={20} className="w-5 h-5" />,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin
  };

  useEffect(() => {
    fetchFooterContents();
  }, []);

  const fetchFooterContents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/footer/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch footer contents");
        throw new Error("Failed to fetch footer contents");
      }

      const data = await response.json();
      setFooterContents(data);
      
      // Set active content if exists
      const active = data.find((content: FooterContent) => content.isActive);
      if (active) {
        setActiveContent(active);
        setFormData({
          companyInfo: active.companyInfo,
          links: active.links,
          socialMedia: active.socialMedia
        });
      }
    } catch (error) {
      toast.error("Failed to load footer contents");
      setError("Failed to load footer contents");
      console.error("Error fetching footer contents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("adminToken");
      const url = activeContent 
        ? `/api/footer/admin/${activeContent._id}`
        : "/api/footer/admin";
      
      const method = activeContent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.error("Failed to save footer content");
        throw new Error("Failed to save footer content");
      }

      const savedContent = await response.json();
      toast.success("Footer content saved successfully!");
      
      if (!activeContent) {
        setActiveContent(savedContent);
      }
      
      await fetchFooterContents();
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save footer content");
      setError("Failed to save footer content");
      console.error("Error saving footer content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/footer/admin/${id}/toggle-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to toggle status");
        throw new Error("Failed to toggle status");
      }

      await fetchFooterContents();
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status");
      setError("Failed to update status");
      console.error("Error toggling status:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/footer/admin/${deleteTarget}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to delete footer content");
        throw new Error("Failed to delete footer content");
      }

      await fetchFooterContents();
      toast.success("Footer content deleted successfully!");
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Failed to delete footer content");
      setError("Failed to delete footer content");
      console.error("Error deleting footer content:", error);
    }
  };

  const addLink = (section: keyof typeof formData.links) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: [...prev.links[section], { name: "", href: "" }]
      }
    }));
  };

  const removeLink = (section: keyof typeof formData.links, index: number) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: prev.links[section].filter((_, i) => i !== index)
      }
    }));
  };

  const updateLink = (section: keyof typeof formData.links, index: number, field: 'name' | 'href', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [section]: prev.links[section].map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  const updateSocialMedia = (index: number, field: 'url' | 'isActive', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map((social, i) => 
        i === index ? { ...social, [field]: value } : social
      )
    }));
  };

  const createNew = () => {
    setActiveContent(null);
    setFormData({
      companyInfo: {
        name: "Paradise Yatra",
        description: "Your trusted partner for unforgettable travel experiences.",
        address: "48, General Mahadev Singh Rd, Dehradun, Uttarakhand 248001",
        phone: "+91 8979396413",
        email: "info@paradiseyatra.com",
        whatsapp: "+91 9873391733"
      },
      links: {
        international: [{ name: "", href: "" }],
        india: [{ name: "", href: "" }],
        trekking: [{ name: "", href: "" }],
        quickLinks: [{ name: "", href: "" }]
      },
      socialMedia: [
        { platform: "facebook", url: "", isActive: true },
        { platform: "twitter", url: "", isActive: true },
        { platform: "instagram", url: "", isActive: true },
        { platform: "youtube", url: "", isActive: true },
        { platform: "linkedin", url: "", isActive: true }
      ]
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer Management</h1>
          <p className="text-gray-600">Manage your website footer content and links</p>
        </div>
        <Button onClick={createNew} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="w-4 h-4" />
          Create New
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Footer Contents List */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {footerContents.map((content) => (
              <motion.div
                key={content._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{content.companyInfo.name}</h3>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(content.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={content.isActive ? "default" : "secondary"}>
                    {content.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(content._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {content.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      setActiveContent(content);
                      setFormData({
                        companyInfo: content.companyInfo,
                        links: content.links,
                        socialMedia: content.socialMedia
                      });
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {activeContent ? "Edit Footer Content" : "Create New Footer Content"}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input
                      value={formData.companyInfo.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, name: e.target.value }
                      }))}
                      placeholder="Company Name"
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.companyInfo.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, phone: e.target.value }
                      }))}
                      placeholder="Phone Number"
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      value={formData.companyInfo.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, email: e.target.value }
                      }))}
                      placeholder="Email Address"
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp</label>
                    <Input
                      value={formData.companyInfo.whatsapp}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, whatsapp: e.target.value }
                      }))}
                      placeholder="WhatsApp Number"
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={formData.companyInfo.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, address: e.target.value }
                      }))}
                      placeholder="Company Address"
                      className="bg-white text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.companyInfo.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyInfo: { ...prev.companyInfo, description: e.target.value }
                      }))}
                      placeholder="Company Description"
                      rows={3}
                      className="bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Links Sections */}
              {(['international', 'india', 'trekking', 'quickLinks'] as const).map((section) => (
                <div key={section} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()} Links
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addLink(section)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.links[section].map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={link.name}
                          onChange={(e) => updateLink(section, index, 'name', e.target.value)}
                          placeholder="Link Name"
                          className="flex-1 bg-white text-gray-900"
                        />
                        <Input
                          value={link.href}
                          onChange={(e) => updateLink(section, index, 'href', e.target.value)}
                          placeholder="Link URL"
                          className="flex-1 bg-white text-gray-900"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLink(section, index)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                <div className="space-y-3">
                  {formData.socialMedia.map((social, index) => {
                    const Icon = socialIcons[social.platform as keyof typeof socialIcons];
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {social.platform === 'twitter' ? (
                          <Icon />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        <Input
                          value={social.url}
                          onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                          placeholder={`${social.platform} URL`}
                          className="flex-1 bg-white text-gray-900"
                        />
                        <Button
                          variant={social.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateSocialMedia(index, 'isActive', !social.isActive)}
                        >
                          {social.isActive ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Saving..." : "Save Footer Content"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete Footer Content"
        message="Are you sure you want to delete this footer content? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminFooter;
