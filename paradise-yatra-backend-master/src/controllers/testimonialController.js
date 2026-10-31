const Testimonial = require("../models/Testimonial");
const cloudinary = require("../config/cloudinary");

// Helper function to transform image paths to full URLs
const transformTestimonialImageUrl = (testimonial, req) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (testimonial.image && !testimonial.image.startsWith("http")) {
    // Remove leading slash to avoid double slashes
    const cleanImagePath = testimonial.image.startsWith("/")
      ? testimonial.image.substring(1)
      : testimonial.image;
    testimonial.image = `${baseUrl}/${cleanImagePath}`;
  }

  return testimonial;
};

// Get all testimonials
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Transform image URLs
    const transformedTestimonials = testimonials.map((testimonial) =>
      transformTestimonialImageUrl(testimonial, req)
    );

    res.json(transformedTestimonials);
  } catch (error) {
    console.error("Get testimonials error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get featured testimonials
const getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isActive: true,
      featured: true,
    }).sort({ createdAt: -1 });

    // Transform image URLs
    const transformedTestimonials = testimonials.map((testimonial) =>
      transformTestimonialImageUrl(testimonial, req)
    );

    res.json(transformedTestimonials);
  } catch (error) {
    console.error("Get featured testimonials error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single testimonial
const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Transform image URL
    const transformedTestimonial = transformTestimonialImageUrl(
      testimonial,
      req
    );

    res.json(transformedTestimonial);
  } catch (error) {
    console.error("Get testimonial error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create testimonial (Admin only)
const createTestimonial = async (req, res) => {
  try {
    // Handle image upload
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "paradise-yatra/testimonials",
        resource_type: "auto",
      });

      // Add Cloudinary URL to req.body
      req.body.image = result.secure_url;
    }

    const testimonial = new Testimonial(req.body);
    await testimonial.save();

    // Transform image URL
    const transformedTestimonial = transformTestimonialImageUrl(
      testimonial,
      req
    );

    res.status(201).json(transformedTestimonial);
  } catch (error) {
    console.error("Create testimonial error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update testimonial (Admin only)
const updateTestimonial = async (req, res) => {
  try {
    // Handle image upload if provided
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "paradise-yatra/testimonials",
        resource_type: "auto",
      });

      // Add Cloudinary URL to req.body
      req.body.image = result.secure_url;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Transform image URL
    const transformedTestimonial = transformTestimonialImageUrl(
      testimonial,
      req
    );

    res.json(transformedTestimonial);
  } catch (error) {
    console.error("Update testimonial error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete testimonial (Admin only)
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllTestimonials,
  getFeaturedTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
