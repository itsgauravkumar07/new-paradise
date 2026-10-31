"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "react-toastify";
import Image from "next/image";
import { Plus, Edit, Trash2, Save, X, ImageIcon } from "lucide-react";

interface PageContent {
    _id: string;
    type: string;
    key: string;
    title: string;
    content: string;
    image: string;
    isActive: boolean;
}

const AdminPageContent = () => {
    const [contents, setContents] = useState<PageContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeContent, setActiveContent] = useState<PageContent | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: "destination_overview",
        key: "",
        title: "",
        content: "",
        image: "",
        isActive: true
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const response = await fetch("/api/page-content", {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });
            const data = await response.json();
            if (data.success) {
                setContents(data.data);
            } else {
                toast.error("Failed to load page content");
            }
        } catch (error) {
            console.error("Error fetching content:", error);
            toast.error("Failed to load page content");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            const uploadData = new FormData();
            uploadData.append('image', file);
            uploadData.append('folder', 'page-content');

            const token = localStorage.getItem("adminToken");
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: uploadData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to upload image");
            return result.url;
        } catch (err) {
            console.error("Image upload failed", err);
            toast.error("Failed to upload image");
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.key.trim() || !formData.content.trim()) {
            toast.error("Key and Content are required");
            return;
        }

        try {
            setIsSubmitting(true);
            let finalImage = formData.image;

            if (imageFile) {
                const uploadedUrl = await handleImageUpload(imageFile);
                if (uploadedUrl) finalImage = uploadedUrl;
            }

            const payload = { ...formData, image: finalImage };
            const token = localStorage.getItem("adminToken");
            const url = isEditing ? `/api/page-content/${activeContent?._id}` : "/api/page-content";
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(`Content ${isEditing ? 'updated' : 'created'} successfully`);
                fetchContents();
                resetForm();
            } else {
                toast.error(result.message || `Failed to ${isEditing ? 'update' : 'create'} content`);
            }
        } catch (error) {
            console.error("Error submitting content:", error);
            toast.error("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem("adminToken");
            const response = await fetch(`/api/page-content/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                toast.success("Content deleted successfully");
                fetchContents();
            } else {
                toast.error("Failed to delete content");
            }
        } catch (error) {
            toast.error("Error deleting content");
        } finally {
            setDeleteId(null);
        }
    };

    const resetForm = () => {
        setFormData({
            type: "destination_overview",
            key: "",
            title: "",
            content: "",
            image: "",
            isActive: true
        });
        setImageFile(null);
        setImagePreview("");
        setIsEditing(false);
        setActiveContent(null);
        setShowCreateForm(false);
    };

    const handleEdit = (content: PageContent) => {
        setActiveContent(content);
        setFormData({
            type: content.type,
            key: content.key,
            title: content.title || "",
            content: content.content,
            image: content.image || "",
            isActive: content.isActive
        });
        setImagePreview(content.image || "");
        setIsEditing(true);
        setShowCreateForm(true);
    };

    const filteredContents = contents.filter(c => 
        c.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Page Content Management</h1>
                    <p className="text-slate-500">Manage dynamic website content such as destination, theme, and package overviews.</p>
                </div>
                <Button 
                    onClick={() => { resetForm(); setShowCreateForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                </Button>
            </div>

            {showCreateForm && (
                <Card className="mb-6 border-blue-100 shadow-md">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-blue-800">
                                {isEditing ? "Edit Content" : "Create New Content"}
                            </CardTitle>
                            <Button variant="ghost" size="icon" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select 
                                        className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        disabled={isEditing}
                                    >
                                        <option value="destination_overview">Destination Overview</option>
                                        <option value="theme_overview">Theme Overview</option>
                                        <option value="package_overview">Package Overview</option>
                                        <option value="other">Other Content</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Key (Identifier)</label>
                                    <Input 
                                        value={formData.key}
                                        onChange={(e) => setFormData({...formData, key: e.target.value})}
                                        placeholder="e.g., kerala, honeymoon"
                                        disabled={isEditing}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Must be unique per type. Use lowercase and hyphens.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title (Optional)</label>
                                <Input 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Optional override title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Content / Description</label>
                                <Textarea 
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    placeholder="Enter the main content or description here..."
                                    rows={6}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image (Optional)</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden relative bg-slate-50">
                                        {imagePreview ? (
                                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImageFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setImagePreview(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Upload a specific image for this overview section if required.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active / Visible</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                    {isSubmitting ? "Saving..." : "Save Content"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Content Blocks</CardTitle>
                        <Input 
                            placeholder="Search content..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading content...</div>
                    ) : filteredContents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">No content found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm font-medium text-slate-500">
                                        <th className="pb-3 pr-4">Type</th>
                                        <th className="pb-3 pr-4">Key</th>
                                        <th className="pb-3 pr-4">Content Snippet</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContents.map((item) => (
                                        <tr key={item._id} className="border-b last:border-0 hover:bg-slate-50/50">
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary" className="capitalize">
                                                    {item.type.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4 font-medium text-slate-700">{item.key}</td>
                                            <td className="py-3 pr-4 text-sm text-slate-500 truncate max-w-xs">
                                                {item.content.substring(0, 60)}...
                                            </td>
                                            <td className="py-3 pr-4">
                                                {item.isActive ? (
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-none">Inactive</Badge>
                                                )}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item._id)}>
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmationDialog 
                isOpen={!!deleteId}
                title="Delete Content"
                message="Are you sure you want to delete this content block? This action cannot be undone."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminPageContent;
