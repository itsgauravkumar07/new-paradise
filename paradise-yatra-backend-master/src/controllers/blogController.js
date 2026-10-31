const Blog = require("../models/Blog");
const mongoose = require("mongoose");
const { processSingleImage } = require("../utils/imageUtils");
const { uploadToCloudinary, extractPublicId } = require("../utils/cloudinaryUpload");
const { slugify } = require("../utils/slugify");

// Helper function to transform image paths to full URLs
const transformBlogImageUrl = (blog) => {
  if (blog.image) {
    blog.image = processSingleImage(blog.image);
  }
  return blog;
};

const getNormalizedSlug = (slugValue, titleValue) => {
  const source =
    typeof slugValue === "string" && slugValue.trim()
      ? slugValue
      : typeof titleValue === "string"
        ? titleValue
        : "";
  return source ? slugify(source) : "";
};

const normalizeFaqs = (faqs) => {
  if (!Array.isArray(faqs)) return [];

  return faqs
    .map((faq, index) => ({
      question: String(faq?.question || "").trim(),
      answer: String(faq?.answer || "").trim(),
      order: Number.isFinite(Number(faq?.order)) ? Number(faq.order) : index + 1,
    }))
    .filter((faq) => faq.question && faq.answer)
    .slice(0, 5)
    .map((faq, index) => ({ ...faq, order: index + 1 }));
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const { category, featured, published, limit = 10, page = 1 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (published === "true") {
      query.isPublished = true;
    }

    let blogsQuery = Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // ?minimal=true: list fields only (no article body), for blog listing pages
    if (req.query.minimal === "true") {
      blogsQuery = blogsQuery.select(
        "title slug excerpt image category readTime views author isFeatured isPublished publishDate createdAt updatedAt"
      );
    }

    const blogs = await blogsQuery;
    const total = await Blog.countDocuments(query);

    // Transform image URLs
    const transformedBlogs = blogs.map((blog) => transformBlogImageUrl(blog));

    res.json({
      blogs: transformedBlogs,
      total,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single blog
const getBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;

    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    } else {
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      // If not found by slug, try to find by title as fallback (for legacy)
      const allBlogs = await Blog.find({ isPublished: true });
      blog = allBlogs.find(b => {
        const generatedSlug = b.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
        return generatedSlug === id;
      });
    }

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const isAdminPreview = req.query.admin === "true";

    if (!isAdminPreview) {
      blog.views += 1;
      await blog.save();
    }

    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog);

    res.json(transformedBlog);
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create blog (Admin only)
const createBlog = async (req, res) => {
  try {
    console.log('📝 Creating blog...');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📝 Request files:', req.files ? Object.keys(req.files) : 'No files');

    // Validate required fields
    const requiredFields = ['title', 'content', 'excerpt', 'author', 'category', 'image'];
    const missingFields = requiredFields.filter(field => !req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim()));

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Handle image upload
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Handle both formidable v2 (file.path) and v3 (file.filepath)
      const filePath = file.filepath || file.path;

      if (!filePath) {
        console.error('❌ No file path found in file object:', file);
        return res.status(400).json({ message: 'Invalid file upload' });
      }

      console.log('🔥 Uploading blog image to Cloudinary folder: paradise-yatra/blogs');
      console.log('🔥 File path:', filePath);
      console.log('🔥 File object keys:', Object.keys(file));
      console.log('🔥 Calling uploadToCloudinary with: filePath, "blogs", null, null');

      // Upload to Cloudinary using the utility function - pass 'blogs' as content type
      // IMPORTANT: First parameter is contentType, must be exactly 'blogs'
      const result = await uploadToCloudinary(filePath, 'blogs', null, null);

      console.log('✅ Blog image uploaded successfully:', result.url);
      console.log('✅ Public ID:', result.public_id);
      console.log('✅ Folder path in URL:', result.url.includes('paradise-yatra/blogs') ? 'CORRECT' : 'WRONG');

      // Add Cloudinary URL to req.body
      req.body.image = result.url;

      // Verify the URL contains the correct path
      if (!req.body.image.includes('paradise-yatra/blogs')) {
        console.error('❌ ERROR: Blog image uploaded to wrong folder!');
        console.error('❌ Expected: paradise-yatra/blogs');
        console.error('❌ Got:', req.body.image);
        return res.status(500).json({ message: 'Blog image uploaded to incorrect Cloudinary folder' });
      }
    }

    console.log('💾 Saving blog to database...');
    // Generate slug from title
    const normalizedSlug = getNormalizedSlug(req.body.slug, req.body.title);
    if (normalizedSlug) {
      const existingSlug = await Blog.findOne({ slug: normalizedSlug });
      if (existingSlug) {
        return res.status(400).json({ message: "Slug already exists." });
      }
      req.body.slug = normalizedSlug;
    }
    req.body.faqs = normalizeFaqs(req.body.faqs);

    const blog = new Blog(req.body);
    await blog.save();
    console.log('✅ Blog saved successfully with ID:', blog._id);

    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog);

    res.status(201).json({
      message: "Blog created successfully",
      blog: transformedBlog,
    });
  } catch (error) {
    console.error("❌ Create blog error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        message: `Validation error: ${validationErrors}`,
        errors: error.errors
      });
    }

    res.status(500).json({
      message: error.message || "Server error during blog creation.",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update blog (Admin only)
const updateBlog = async (req, res) => {
  try {
    // Get existing blog to extract old image public_id
    const existingBlog = await Blog.findById(req.params.id);

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    // Handle image upload if provided
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Handle both formidable v2 (file.path) and v3 (file.filepath)
      const filePath = file.filepath || file.path;

      if (!filePath) {
        console.error('❌ No file path found in file object:', file);
        return res.status(400).json({ message: 'Invalid file upload' });
      }

      console.log('🔥 New blog image detected for update');
      console.log('🔥 Uploading to Cloudinary folder: paradise-yatra/blogs');
      console.log('🔥 File path:', filePath);

      // Extract old image public_id for deletion
      const oldPublicId = existingBlog.image ? extractPublicId(existingBlog.image) : null;
      console.log('🗑️ Old blog image public_id for deletion:', oldPublicId);

      // Upload new image to paradise-yatra/blogs and delete old one
      const result = await uploadToCloudinary(filePath, 'blogs', null, oldPublicId);

      console.log('✅ Upload result:', result);
      console.log('✅ New blog image URL:', result.url);
      console.log('✅ New public ID:', result.public_id);
      console.log('✅ Folder path in URL:', result.url.includes('paradise-yatra/blogs') ? 'CORRECT' : 'WRONG');

      // Add Cloudinary URL to req.body
      req.body.image = result.url;

      // Verify the URL contains the correct path
      if (!req.body.image.includes('paradise-yatra/blogs')) {
        console.error('❌ ERROR: Blog image uploaded to wrong folder!');
        console.error('❌ Expected: paradise-yatra/blogs');
        console.error('❌ Got:', req.body.image);
        return res.status(500).json({ message: 'Blog image uploaded to incorrect Cloudinary folder' });
      }
    }

    let normalizedSlug = "";
    if (req.body.slug !== undefined) {
      normalizedSlug = getNormalizedSlug(
        req.body.slug,
        req.body.title || existingBlog.title
      );
      if (normalizedSlug) {
        const conflict = await Blog.findOne({
          slug: normalizedSlug,
          _id: { $ne: req.params.id },
        });
        if (conflict) {
          return res.status(400).json({ message: "Slug already exists." });
        }
        req.body.slug = normalizedSlug;
      } else {
        delete req.body.slug;
      }
    } else if (req.body.title) {
      normalizedSlug = getNormalizedSlug("", req.body.title);
      if (normalizedSlug) {
        const conflict = await Blog.findOne({
          slug: normalizedSlug,
          _id: { $ne: req.params.id },
        });
        if (conflict) {
          return res.status(400).json({ message: "Slug already exists." });
        }
        req.body.slug = normalizedSlug;
      }
    }
    if (req.body.faqs !== undefined) {
      req.body.faqs = normalizeFaqs(req.body.faqs);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    console.log('✅ Blog updated successfully');
    console.log('✅ Current image:', blog.image);

    // Transform image URL
    const transformedBlog = transformBlogImageUrl(blog);

    res.json({
      message: "Blog updated successfully",
      blog: transformedBlog,
    });
  } catch (error) {
    console.error("❌ Update blog error:", error);
    res.status(500).json({ message: error.message || "Server error during blog update." });
  }
};

// Delete blog (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    // Delete image from Cloudinary if it exists
    if (blog.image) {
      const publicId = extractPublicId(blog.image);
      if (publicId) {
        try {
          const { deleteFromCloudinary } = require("../utils/cloudinaryUpload");
          await deleteFromCloudinary(publicId);
          console.log(`✅ Deleted blog image from Cloudinary: ${publicId}`);
        } catch (deleteError) {
          console.error(`⚠️ Failed to delete blog image from Cloudinary:`, deleteError.message);
          // Continue with blog deletion even if image deletion fails
        }
      }
    }

    // Delete the blog
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error during blog deletion." });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Increased default limit to 10

    // Get published blogs, sorted by createdAt (latest first) to show newest blogs
    // Filter to only published blogs for frontend display
    let blogsQuery = Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    if (req.query.minimal === 'true') {
      blogsQuery = blogsQuery.select('title slug excerpt image category createdAt author views likes isPublished isFeatured');
    }

    const blogs = await blogsQuery;

    console.log(`📝 getFeaturedBlogs: Returning ${blogs.length} blogs, sorted by createdAt (latest first)`);
    if (blogs.length > 0) {
      console.log(`📝 Latest blog: "${blogs[0].title}" - Created: ${blogs[0].createdAt}`);
    }

    // Transform image URLs
    const transformedBlogs = blogs.map((blog) => transformBlogImageUrl(blog));

    res.json(transformedBlogs);
  } catch (error) {
    console.error("Get featured blogs error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Search blogs
const searchBlogs = async (req, res) => {
  try {
    const { q, category, author } = req.query;

    let query = { isPublished: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: author, $options: "i" };
    }

    const blogs = await Blog.find(query).sort({ views: -1, createdAt: -1 });

    // Transform image URLs
    const transformedBlogs = blogs.map((blog) => transformBlogImageUrl(blog));

    res.json(transformedBlogs);
  } catch (error) {
    console.error("Search blogs error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Like blog
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    blog.likes += 1;
    await blog.save();

    res.json({
      message: "Blog liked successfully",
      likes: blog.likes,
    });
  } catch (error) {
    console.error("Like blog error:", error);
    res.status(500).json({ message: "Server error during blog like." });
  }
};

module.exports = {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  searchBlogs,
  likeBlog,
};
