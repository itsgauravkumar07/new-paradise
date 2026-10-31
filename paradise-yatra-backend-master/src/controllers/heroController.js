const HeroContent = require("../models/HeroContent");
const cloudinary = require("../config/cloudinary");

// Get active hero content
const getHeroContent = async (req, res) => {
  try {
    const heroContent = await HeroContent.findOne({ isActive: true });
    if (!heroContent) {
      // Return default content if none exists
      return res.json({
        title: "Your Next Adventure Awaits",
        subtitle: "Unforgettable journeys, handpicked for you",
        description: "Explore, dream, and discover with Paradise Yatra.",
        backgroundImage: "https://wallpapercave.com/wp/wp10918600.jpg",
        trustBadgeText: "Trusted by 5000+ travelers",
        popularDestinations: [
          "Himachal Pradesh",
          "Uttarakhand",
          "Bali",
          "Europe",
          "Goa",
        ],
        ctaButtonText: "Explore Packages",
        secondaryButtonText: "Watch Video",
      });
    }

    // Cloudinary URLs are already complete, no transformation needed
    res.json(heroContent);
  } catch (error) {
    console.error("Get hero content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create hero content (Admin only)
const createHeroContent = async (req, res) => {
  try {
    // Handle backgroundImage upload
    if (req.files && req.files.backgroundImage) {
      const file = req.files.backgroundImage;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "paradise-yatra/hero",
        resource_type: "auto",
      });

      // Add Cloudinary URL to req.body
      req.body.backgroundImage = result.secure_url;
    }

    // Deactivate existing hero content
    await HeroContent.updateMany({}, { isActive: false });

    const heroContent = new HeroContent(req.body);
    await heroContent.save();

    res.status(201).json(heroContent);
  } catch (error) {
    console.error("Create hero content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update hero content (Admin only)
const updateHeroContent = async (req, res) => {
  try {
    // Handle backgroundImage upload if provided
    if (req.files && req.files.backgroundImage) {
      const file = req.files.backgroundImage;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: "paradise-yatra/hero",
        resource_type: "auto",
      });

      // Add Cloudinary URL to req.body
      req.body.backgroundImage = result.secure_url;
    }

    const heroContent = await HeroContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!heroContent) {
      return res.status(404).json({ message: "Hero content not found" });
    }

    res.json(heroContent);
  } catch (error) {
    console.error("Update hero content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete hero content (Admin only)
const deleteHeroContent = async (req, res) => {
  try {
    const heroContent = await HeroContent.findByIdAndDelete(req.params.id);
    if (!heroContent) {
      return res.status(404).json({ message: "Hero content not found" });
    }
    res.json({ message: "Hero content deleted successfully" });
  } catch (error) {
    console.error("Delete hero content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getHeroContent,
  createHeroContent,
  updateHeroContent,
  deleteHeroContent,
};
