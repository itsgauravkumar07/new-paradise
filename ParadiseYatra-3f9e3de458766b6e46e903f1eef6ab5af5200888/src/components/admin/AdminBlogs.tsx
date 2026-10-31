"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Edit, Save, X, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ui/image-upload";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  imageAlt?: string;
  slug: string;
  status: "published" | "draft";
  isActive: boolean;
  faqs?: BlogFAQ[];
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoOgTitle?: string;
  seoOgDescription?: string;
  seoOgImage?: string;
  seoTwitterTitle?: string;
  seoTwitterDescription?: string;
  seoTwitterImage?: string;
  seoCanonicalUrl?: string;
  seoRobotsIndex?: boolean;
  seoRobotsFollow?: boolean;
  seoAuthor?: string;
  seoPublisher?: string;
  seoArticleSection?: string;
  seoArticleTags?: string[];
  // Backend fields
  isPublished?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogFAQ {
  question: string;
  answer: string;
  order: number;
}

interface AdminBlogsProps {
  initialAction?: string | null;
  onActionComplete?: () => void;
}

const AdminBlogs = ({ initialAction, onActionComplete }: AdminBlogsProps) => {
  const parseMetaList = (value: string) =>
    value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const sanitizeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

  const MAX_FAQS = 5;

  const normalizeFaqs = (faqs: BlogFAQ[] = []): BlogFAQ[] => {
    return faqs
      .map((faq, index) => ({
        question: (faq.question || "").trim(),
        answer: (faq.answer || "").trim(),
        order: Number.isFinite(Number(faq.order)) ? Number(faq.order) : index + 1,
      }))
      .filter((faq) => faq.question && faq.answer)
      .slice(0, MAX_FAQS)
      .map((faq, index) => ({ ...faq, order: index + 1 }));
  };

  const getBlogTimestamp = (blog: Partial<BlogPost>) => {
    return new Date(
      blog.publishDate || blog.createdAt || blog.updatedAt || 0
    ).getTime();
  };

  const sortBlogsByLatest = (blogsToSort: BlogPost[]) => {
    return [...blogsToSort].sort(
      (a, b) => getBlogTimestamp(b) - getBlogTimestamp(a)
    );
  };

  const normalizeBlogForAdmin = (blog: BlogPost): BlogPost => ({
    ...blog,
    status:
      blog.isPublished !== undefined
        ? blog.isPublished
          ? "published"
          : "draft"
        : blog.status || "draft",
    readTime: blog.readTime?.toString() || "5",
    publishDate: blog.publishDate || blog.createdAt || "",
    isActive: blog.isActive !== undefined ? blog.isActive : true,
    slug: blog.slug || "",
    faqs: normalizeFaqs(blog.faqs || []),
  });

  const applyBlogsState = (blogsToApply: BlogPost[]) => {
    const normalizedBlogs = sortBlogsByLatest(
      blogsToApply.map(normalizeBlogForAdmin)
    );

    setAllBlogs(normalizedBlogs);
    setTotalBlogs(normalizedBlogs.length);
    setTotalPages(Math.max(1, Math.ceil(normalizedBlogs.length / blogsPerPage)));
  };

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]); // Store all blogs
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const blogsPerPage = 10; // Show 10 blogs per page
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    blogId: string | null;
    blogTitle: string;
  }>({
    isOpen: false,
    blogId: null,
    blogTitle: "",
  });

  // Handle initial action from sidebar
  useEffect(() => {
    if (initialAction === "create") {
      setActiveTab("create");
      setEditing(null);
      onActionComplete?.();
    }
  }, [initialAction, onActionComplete]);

  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    status: "draft",
    readTime: "",
    image: "",
    imageAlt: "",
    slug: "",
    publishDate: "",
    isActive: true,
    faqs: [],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    seoOgTitle: "",
    seoOgDescription: "",
    seoOgImage: "",
    seoTwitterTitle: "",
    seoTwitterDescription: "",
    seoTwitterImage: "",
    seoCanonicalUrl: "",
    seoRobotsIndex: true,
    seoRobotsFollow: true,
    seoAuthor: "",
    seoPublisher: "Paradise Yatra",
    seoArticleSection: "",
    seoArticleTags: [],
  });
  const [seoKeywordsInput, setSeoKeywordsInput] = useState("");
  const [seoArticleTagsInput, setSeoArticleTagsInput] = useState("");

  useEffect(() => {
    fetchBlogs(); // Fetch all blogs once
  }, []);

  // Update paginated blogs when page changes or allBlogs updates
  useEffect(() => {
    if (allBlogs.length > 0) {
      const startIndex = (currentPage - 1) * blogsPerPage;
      const endIndex = startIndex + blogsPerPage;
      const paginatedBlogs = allBlogs.slice(startIndex, endIndex);
      setBlogs(paginatedBlogs);

      // Update total pages based on allBlogs
      const totalPagesCount = Math.ceil(allBlogs.length / blogsPerPage);
      setTotalPages(totalPagesCount);

      // Reset to page 1 if current page is out of bounds
      if (currentPage > totalPagesCount && totalPagesCount > 0) {
        setCurrentPage(1);
      }
    } else {
      setBlogs([]);
      setTotalPages(1);
    }
  }, [currentPage, allBlogs, blogsPerPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Fetch all blogs for admin (use high limit to get all)
      const response = await fetch(`/api/blogs?limit=1000&admin=true`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (response.ok) {
        let blogsArray: BlogPost[] = [];

        // Handle both response formats
        if (Array.isArray(data)) {
          blogsArray = data;
        } else if (data.blogs && Array.isArray(data.blogs)) {
          blogsArray = data.blogs;
        } else {
          console.error("Unexpected data structure:", data);
          blogsArray = [];
        }

        applyBlogsState(blogsArray);

        const total = blogsArray.length;
        const totalPagesCount = Math.max(1, Math.ceil(total / blogsPerPage));
        setTotalPages(totalPagesCount);

        // Reset to page 1 if current page is out of bounds
        if (currentPage > totalPagesCount && totalPagesCount > 0) {
          setCurrentPage(1);
        }
      } else {
        console.error("Failed to fetch blogs:", data.message);
        setBlogs([]);
        setAllBlogs([]);
        setTotalBlogs(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
      setAllBlogs([]);
      setTotalBlogs(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/blogs/${editing}` : "/api/blogs";

      // Get the admin token from localStorage
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Please log in to save changes");
        setSaving(false);
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        toast.error("Please enter a blog title");
        setSaving(false);
        return;
      }

      if (!formData.content || !formData.content.trim()) {
        toast.error("Please enter blog content");
        setSaving(false);
        return;
      }

      if (!formData.excerpt || !formData.excerpt.trim()) {
        toast.error("Please enter a blog excerpt");
        setSaving(false);
        return;
      }

      if (!formData.author || !formData.author.trim()) {
        toast.error("Please enter an author name");
        setSaving(false);
        return;
      }

      if (!formData.category || !formData.category.trim()) {
        toast.error("Please enter a category");
        setSaving(false);
        return;
      }

      if (!formData.image || !formData.image.trim()) {
        toast.error("Please upload a blog image");
        setSaving(false);
        return;
      }

      // Transform formData to match backend expectations
      const sanitizedSlug = sanitizeSlug(formData.slug || "");
      const fallbackSlug = sanitizeSlug(formData.title);

      const backendData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        author: formData.author.trim(),
        category: formData.category.trim(),
        image: formData.image.trim(),
        imageAlt: formData.imageAlt?.trim() || "",
        slug: sanitizedSlug || fallbackSlug,
        readTime: parseInt(formData.readTime) || 5,
        isPublished: formData.status === "published",
        isFeatured: formData.status === "published", // Auto-mark published blogs as featured
        faqs: normalizeFaqs(formData.faqs || []),
        // SEO fields
        seoTitle: formData.seoTitle?.trim() || "",
        seoDescription: formData.seoDescription?.trim() || "",
        seoKeywords: parseMetaList(seoKeywordsInput),
        seoOgTitle: formData.seoOgTitle?.trim() || "",
        seoOgDescription: formData.seoOgDescription?.trim() || "",
        seoOgImage: formData.seoOgImage?.trim() || "",
        seoTwitterTitle: formData.seoTwitterTitle?.trim() || "",
        seoTwitterDescription: formData.seoTwitterDescription?.trim() || "",
        seoTwitterImage: formData.seoTwitterImage?.trim() || "",
        seoCanonicalUrl: formData.seoCanonicalUrl?.trim() || "",
        seoRobotsIndex: formData.seoRobotsIndex !== undefined ? formData.seoRobotsIndex : true,
        seoRobotsFollow: formData.seoRobotsFollow !== undefined ? formData.seoRobotsFollow : true,
        seoAuthor: formData.seoAuthor?.trim() || "",
        seoPublisher: formData.seoPublisher?.trim() || "Paradise Yatra",
        seoArticleSection: formData.seoArticleSection?.trim() || "",
        seoArticleTags: parseMetaList(seoArticleTagsInput),
      };

      // Check if we need to upload a file
      // Note: If image is already a Cloudinary URL (from ImageUpload component), 
      // we don't need to upload it again - just send it as part of the form data
      const hasFileUpload =
        formData.image &&
        (formData.image.startsWith("blob:") ||
          formData.image.startsWith("data:"));

      console.log("💾 Saving blog:", {
        editing: editing ? "Update" : "Create",
        hasFileUpload,
        imageType: formData.image ? (formData.image.startsWith("http") ? "URL" : "File") : "None",
        title: formData.title,
      });

      let response;
      if (hasFileUpload) {
        // Handle file upload
        const uploadFormData = new FormData();

        // Handle image file conversion first - MUST await this
        if (formData.image) {
          let file: File;

          try {
            if (formData.image.startsWith("blob:")) {
              // Convert blob URL to file
              const blobResponse = await fetch(formData.image);
              if (!blobResponse.ok) {
                throw new Error('Failed to fetch blob');
              }
              const blob = await blobResponse.blob();
              file = new File([blob], "blog-image.jpg", {
                type: blob.type || "image/jpeg",
              });
            } else if (formData.image.startsWith("data:")) {
              // Convert data URL to file
              const dataResponse = await fetch(formData.image);
              if (!dataResponse.ok) {
                throw new Error('Failed to fetch data URL');
              }
              const blob = await dataResponse.blob();
              file = new File([blob], "blog-image.jpg", {
                type: blob.type || "image/jpeg",
              });
            } else {
              // If it's already a file object
              file = formData.image as unknown as File;
            }

            uploadFormData.append("image", file);
          } catch (fileError) {
            console.error("Error converting image file:", fileError);
            toast.error("Failed to process image file. Please try again.");
            setSaving(false);
            return;
          }
        }

        // Add all other form fields (excluding image which is already added)
        Object.keys(backendData).forEach((key) => {
          const value = (backendData as Record<string, unknown>)[key];
          if (key !== "image" && value !== undefined && value !== null) {
            if (typeof value === "object" && !Array.isArray(value)) {
              uploadFormData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
              uploadFormData.append(key, JSON.stringify(value));
            } else {
              uploadFormData.append(key, String(value));
            }
          }
        });

        try {
          console.log("📤 Sending FormData request to:", url);
          response = await fetch(url, {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type - browser will set it with boundary
            },
            body: uploadFormData,
          });
          console.log("📥 FormData response status:", response.status);
        } catch (fetchError) {
          console.error("❌ Fetch error:", fetchError);
          toast.error("Network error. Please check your connection and try again.");
          setSaving(false);
          return;
        }
      } else {
        // Handle regular JSON data
        try {
          console.log("📤 Sending JSON request to:", url);
          console.log("📤 Request data:", JSON.stringify(backendData, null, 2));
          response = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(backendData),
          });
          console.log("📥 JSON response status:", response.status);
        } catch (fetchError) {
          console.error("❌ Fetch error:", fetchError);
          toast.error("Network error. Please check your connection and try again.");
          setSaving(false);
          return;
        }
      }

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorMessage = "Unknown error";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || "Unknown error";
          console.error("❌ Server error response:", errorData);
        } catch (parseError) {
          const responseText = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error("❌ Failed to parse error response:", responseText);
        }
        console.error("❌ Failed to save blog:", errorMessage);
        toast.error(`Failed to save: ${errorMessage}`);
        setSaving(false);
        return;
      }

      let data;
      try {
        const responseText = await response.text();
        console.log("✅ Response text:", responseText);
        data = JSON.parse(responseText);
        console.log("✅ Parsed response data:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse response:", parseError);
        toast.error("Failed to parse server response");
        setSaving(false);
        return;
      }

      if (data.message || data.blog) {
        console.log("✅ Blog saved successfully!");
        if (data.blog) {
          const savedBlogId = data.blog._id || data.blog.id;
          const nextBlogs = savedBlogId
            ? [
                data.blog,
                ...allBlogs.filter(
                  (blog) => (blog._id || blog.id) !== savedBlogId
                ),
              ]
            : [data.blog, ...allBlogs];

          applyBlogsState(nextBlogs);
        } else {
          await fetchBlogs();
        }

        setCurrentPage(1); // Reset to first page
        setEditing(null);
        setActiveTab("all");
        resetForm();
        toast.success(
          editing ? "Blog updated successfully!" : "Blog added successfully!"
        );
      } else {
        console.error("❌ Unexpected response format:", data);
        toast.error("Unexpected response from server. Please check the console for details.");
      }
    } catch (error) {
      console.error("Error saving blog:", error);
      const errorMessage = error instanceof Error ? error.message : "Network error. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const resetFaqForm = () => {
    setFaqQuestion("");
    setFaqAnswer("");
    setEditingFaqIndex(null);
  };

  const handleSaveFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      toast.error("Please enter both a question and an answer");
      return;
    }

    const currentFaqs = normalizeFaqs(formData.faqs || []);
    if (editingFaqIndex === null && currentFaqs.length >= MAX_FAQS) {
      toast.error(`Maximum ${MAX_FAQS} FAQs allowed per blog post`);
      return;
    }

    const nextFaqs = [...currentFaqs];
    const faqPayload: BlogFAQ = {
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      order: editingFaqIndex !== null ? editingFaqIndex + 1 : nextFaqs.length + 1,
    };

    if (editingFaqIndex !== null) {
      nextFaqs[editingFaqIndex] = faqPayload;
    } else {
      nextFaqs.push(faqPayload);
    }

    setFormData((prev) => ({
      ...prev,
      faqs: normalizeFaqs(nextFaqs),
    }));
    resetFaqForm();
  };

  const handleEditFaq = (index: number) => {
    const currentFaqs = normalizeFaqs(formData.faqs || []);
    const faq = currentFaqs[index];
    if (!faq) return;
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setEditingFaqIndex(index);
  };

  const handleDeleteFaq = (index: number) => {
    const currentFaqs = normalizeFaqs(formData.faqs || []);
    const nextFaqs = currentFaqs.filter((_, idx) => idx !== index);
    setFormData((prev) => ({
      ...prev,
      faqs: normalizeFaqs(nextFaqs),
    }));

    if (editingFaqIndex === index) {
      resetFaqForm();
    } else if (editingFaqIndex !== null && index < editingFaqIndex) {
      setEditingFaqIndex(editingFaqIndex - 1);
    }
  };

  const handleMoveFaq = (index: number, direction: -1 | 1) => {
    const currentFaqs = normalizeFaqs(formData.faqs || []);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= currentFaqs.length) return;

    const nextFaqs = [...currentFaqs];
    [nextFaqs[index], nextFaqs[swapIndex]] = [nextFaqs[swapIndex], nextFaqs[index]];

    setFormData((prev) => ({
      ...prev,
      faqs: normalizeFaqs(nextFaqs),
    }));

    if (editingFaqIndex === index) {
      setEditingFaqIndex(swapIndex);
    } else if (editingFaqIndex === swapIndex) {
      setEditingFaqIndex(index);
    }
  };

  const handleEdit = async (blog: BlogPost) => {
    const blogId = blog._id || blog.id || "";
    setEditing(blogId);

    let blogForEdit = blog;

    if (blogId) {
      try {
        const response = await fetch(`/api/blogs/${blogId}?admin=true`, {
          cache: "no-store",
        });

        if (response.ok) {
          const latestBlog = await response.json();
          if (latestBlog) {
            blogForEdit = latestBlog;
          }
        } else {
          const errorData = await response.json().catch(() => null);
          console.error("Failed to fetch full blog for editing:", errorData);
        }
      } catch (error) {
        console.error("Error fetching full blog for editing:", error);
      }
    }

    const frontendData = normalizeBlogForAdmin(blogForEdit);
    setFormData(frontendData);
    setSeoKeywordsInput((frontendData.seoKeywords || []).join(", "));
    setSeoArticleTagsInput((frontendData.seoArticleTags || []).join(", "));
    resetFaqForm();
    setActiveTab("create");
  };

  const handleDelete = async (id: string) => {
    // Find the blog to get its title for the confirmation dialog
    const blog = blogs.find((b) => b._id === id || b.id === id);
    if (blog) {
      setDeleteDialog({
        isOpen: true,
        blogId: id,
        blogTitle: blog.title,
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.blogId) return;

    try {
      // Get the admin token from localStorage
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Please log in to delete blogs");
        return;
      }

      const response = await fetch(`/api/blogs/${deleteDialog.blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        await fetchBlogs(); // Refresh all blogs
        // If current page becomes empty after deletion, go to previous page
        const remainingBlogs = totalBlogs - 1;
        const newTotalPages = Math.ceil(remainingBlogs / blogsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        toast.success("Blog deleted successfully!");
      } else {
        console.error("Failed to delete blog:", data.message);
        toast.error(`Failed to delete: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setDeleteDialog({ isOpen: false, blogId: null, blogTitle: "" });
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setActiveTab("all");
    resetForm();
    resetFaqForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      status: "draft",
      readTime: "",
      image: "📝",
      imageAlt: "",
      slug: "",
      publishDate: "",
      isActive: true,
      faqs: [],
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      seoOgTitle: "",
      seoOgDescription: "",
      seoOgImage: "",
      seoTwitterTitle: "",
      seoTwitterDescription: "",
      seoTwitterImage: "",
      seoCanonicalUrl: "",
      seoRobotsIndex: true,
      seoRobotsFollow: true,
      seoAuthor: "",
      seoPublisher: "Paradise Yatra",
      seoArticleSection: "",
      seoArticleTags: [],
    });
    setSeoKeywordsInput("");
    setSeoArticleTagsInput("");
    resetFaqForm();
  };

  const handleAddNew = () => {
    setEditing(null);
    setActiveTab("create");
    resetForm();
  };

  const handleShowAllBlogs = () => {
    setActiveTab("all");
    setEditing(null);
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
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-slate-500 font-medium mt-1">
            {activeTab === "all"
              ? `Manage blog posts and articles (${totalBlogs} blogs)`
              : editing
                ? "Edit blog post"
                : "Create new blog post"}
          </p>
        </div>
        <div className="relative z-10">
          <Button
            onClick={() => {
              setActiveTab("create");
              setEditing(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 shadow-indigo-500/25 shadow-lg text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all transform"
          >
            <Plus size={20} /> Add New Blog
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm w-fit relative z-10">
        <button
          onClick={handleShowAllBlogs}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "all"
            ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
        >
          All Blogs ({totalBlogs})
        </button>
        <button
          onClick={handleAddNew}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "create"
            ? "bg-white text-indigo-700 shadow-sm border border-slate-100"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
        >
          {editing ? "Edit Blog" : "Create Blog"}
        </button>
      </div>

      {activeTab === "create" && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {editing ? "Edit Blog Post" : "Add New Blog Post"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  maxLength={60}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Blog post title"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                  placeholder="Author name"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Travel Guide"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Read Time
                </label>
                <Input
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      readTime: e.target.value,
                    }))
                  }
                  placeholder="5 min read"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "published" | "draft",
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief description of the blog post..."
                rows={3}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Write your blog content here..."
                contentType="blogs"
              />
            </div>

            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Blog FAQs</h3>
                  <p className="text-xs text-gray-500">
                    Add up to {MAX_FAQS} FAQs for this blog post.
                  </p>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {(formData.faqs?.length || 0)}/{MAX_FAQS}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <Input
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    placeholder="Enter the FAQ question"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer
                  </label>
                  <Textarea
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    placeholder="Enter the FAQ answer"
                    rows={2}
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Button
                  type="button"
                  onClick={handleSaveFaq}
                  variant="admin-primary"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingFaqIndex !== null ? "Update FAQ" : "Add FAQ"}
                </Button>
                {editingFaqIndex !== null && (
                  <Button
                    type="button"
                    onClick={resetFaqForm}
                    variant="admin-outline"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {(formData.faqs || []).length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No FAQs added yet.
                  </p>
                ) : (
                  (formData.faqs || []).map((faq, index) => (
                    <div
                      key={`${faq.question}-${index}`}
                      className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between bg-white border border-gray-200 rounded-md p-3"
                    >
                      <div className="flex-1 md:pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">
                            #{index + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {faq.question}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="admin-outline"
                          onClick={() => handleMoveFaq(index, -1)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="admin-outline"
                          onClick={() => handleMoveFaq(index, 1)}
                          disabled={index === (formData.faqs?.length || 0) - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="admin-primary"
                          onClick={() => handleEditFaq(index)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="admin-secondary"
                          className="bg-red-600 text-white hover:cursor-pointer"
                          onClick={() => handleDeleteFaq(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      if (!formData.title) {
                        toast.error("Please enter a title first");
                        return;
                      }
                      const generatedSlug = sanitizeSlug(formData.title);
                      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
                      toast.success("Slug generated from title!");
                    }}
                  >
                    Generate from Title
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    value={formData.slug}
                    onChange={(e) => {
                      const val = sanitizeSlug(e.target.value);
                      setFormData((prev) => ({ ...prev, slug: val }));
                    }}
                    placeholder="blog-post-slug"
                    className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 pr-8"
                  />
                  {formData.slug && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, slug: "" }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  SEO friendly URL path (e.g. "kedarnath-yatra-guide")
                </p>
              </div>
              <div>
                <div>
                  <ImageUpload
                    value={formData.image}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, image: value }))
                    }
                    label="Blog Image"
                    contentType="blogs"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Images will be uploaded to Cloudinary: paradise-yatra/blogs
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Alt Text
              </label>
              <Input
                value={formData.imageAlt || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageAlt: e.target.value }))
                }
                placeholder="Describe the image for accessibility and SEO (e.g., 'Mountain landscape with snow peaks')"
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Important for accessibility and SEO. Describe what the image
                shows.
              </p>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                SEO & Meta Tags
              </h3>

              <div className="space-y-6">
                {/* Basic SEO */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Basic SEO
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Title
                      </label>
                      <Input
                        value={formData.seoTitle || ""}
                        maxLength={60}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoTitle: e.target.value,
                          }))
                        }
                        placeholder="SEO optimized title (optional)"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use the main title. Recommended: 50-60
                        characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <Textarea
                        value={formData.seoDescription || ""}
                        maxLength={160}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoDescription: e.target.value,
                          }))
                        }
                        placeholder="Brief description for search engines (150-160 characters recommended)"
                        rows={3}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seoDescription
                          ? `${formData.seoDescription.length}/160 characters`
                          : "0/160 characters"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Keywords
                      </label>
                      <Input
                        value={seoKeywordsInput}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setSeoKeywordsInput(nextValue);
                          setFormData((prev) => ({
                            ...prev,
                            seoKeywords: parseMetaList(nextValue),
                          }));
                        }}
                        placeholder="keyword1, keyword2, keyword3"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use comma or space to separate keywords
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL
                      </label>
                      <Input
                        value={formData.seoCanonicalUrl || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoCanonicalUrl: e.target.value,
                          }))
                        }
                        placeholder="https://yourdomain.com/blog/post-slug"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-blue-800 mb-3">
                    Open Graph (Facebook/LinkedIn)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Title
                      </label>
                      <Input
                        value={formData.seoOgTitle || ""}
                        maxLength={60}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoOgTitle: e.target.value,
                          }))
                        }
                        placeholder="Open Graph title (optional)"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Description
                      </label>
                      <Textarea
                        value={formData.seoOgDescription || ""}
                        maxLength={160}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoOgDescription: e.target.value,
                          }))
                        }
                        placeholder="Open Graph description (optional)"
                        rows={2}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OG Image
                      </label>
                      <ImageUpload
                        value={formData.seoOgImage || ""}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoOgImage: value,
                          }))
                        }
                        label=""
                        contentType="blogs"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 1200x630 pixels
                      </p>
                    </div>
                  </div>
                </div>

                {/* Twitter Cards */}
                <div className="bg-sky-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-sky-800 mb-3">
                    Twitter Cards
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter Title
                      </label>
                      <Input
                        value={formData.seoTwitterTitle || ""}
                        maxLength={60}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoTwitterTitle: e.target.value,
                          }))
                        }
                        placeholder="Twitter title (optional)"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter Description
                      </label>
                      <Textarea
                        value={formData.seoTwitterDescription || ""}
                        maxLength={160}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoTwitterDescription: e.target.value,
                          }))
                        }
                        placeholder="Twitter description (optional)"
                        rows={2}
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter Image
                      </label>
                      <ImageUpload
                        value={formData.seoTwitterImage || ""}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoTwitterImage: value,
                          }))
                        }
                        label=""
                        contentType="blogs"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 1200x675 pixels
                      </p>
                    </div>
                  </div>
                </div>

                {/* Article Schema */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-green-800 mb-3">
                    Article Schema
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author
                      </label>
                      <Input
                        value={formData.seoAuthor || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoAuthor: e.target.value,
                          }))
                        }
                        placeholder="Article author name"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publisher
                      </label>
                      <Input
                        value={formData.seoPublisher || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoPublisher: e.target.value,
                          }))
                        }
                        placeholder="Publisher name"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Section
                      </label>
                      <Input
                        value={formData.seoArticleSection || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            seoArticleSection: e.target.value,
                          }))
                        }
                        placeholder="e.g., Travel, Adventure, Culture"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Tags
                      </label>
                      <Input
                        value={seoArticleTagsInput}
                        onChange={(e) => {
                          const nextValue = e.target.value;
                          setSeoArticleTagsInput(nextValue);
                          setFormData((prev) => ({
                            ...prev,
                            seoArticleTags: parseMetaList(nextValue),
                          }));
                        }}
                        placeholder="tag1, tag2, tag3"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use comma or space to separate tags
                      </p>
                    </div>
                  </div>
                </div>

                {/* Robots */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-yellow-800 mb-3">
                    Search Engine Indexing
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.seoRobotsIndex || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              seoRobotsIndex: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Allow indexing
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.seoRobotsFollow || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              seoRobotsFollow: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Allow following links
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCancel}
                variant="admin-outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="admin-primary"
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Update Blog" : "Create Blog"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Blog count and pagination info */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {totalBlogs > 0 ? (
                <>Showing {(currentPage - 1) * blogsPerPage + 1} - {Math.min(currentPage * blogsPerPage, totalBlogs)} of {totalBlogs} blogs</>
              ) : (
                <>No blogs found</>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  className={
                    currentPage === 1
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
                      : "bg-black text-white hover:bg-gray-800 transition-colors"
                  }
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  className={
                    currentPage === totalPages
                      ? "bg-gray-400 text-white cursor-not-allowed opacity-60"
                      : "bg-black text-white hover:bg-gray-800 transition-colors"
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No blogs found. Create your first blog post!
              </p>
            </div>
          ) : (
            blogs.map((blog) => (
              <Card
                key={blog._id || blog.id}
                className="bg-white border-gray-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="!text-lg !font-semibold !text-gray-900">
                          {blog.title}
                        </h3>
                        <Badge
                          variant={
                            blog.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            blog.status === "published"
                              ? "bg-green-600 text-white"
                              : "bg-gray-500 text-white"
                          }
                        >
                          {blog.status}
                        </Badge>
                      </div>
                      <p className="!text-sm !text-gray-700 mb-2">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {blog.author}</span>
                        <span>•</span>
                        <span>{blog.category}</span>
                        <span>•</span>
                        <span>{blog.readTime} min read</span>
                        {blog.publishDate && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(blog.publishDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(blog)}
                        variant="admin-primary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(blog._id || blog.id || "")}
                        variant="admin-secondary"
                        size="sm"
                        className="flex items-center gap-1 bg-red-600 text-white hover:cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, blogId: null, blogTitle: "" })
        }
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteDialog.blogTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default AdminBlogs;
