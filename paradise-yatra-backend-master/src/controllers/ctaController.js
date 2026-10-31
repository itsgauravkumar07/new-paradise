const CTAContent = require("../models/CTAContent");

// Helper function to transform image paths to full URLs
const transformCTAImageUrl = (ctaContent, req) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (
    ctaContent.backgroundImage &&
    !ctaContent.backgroundImage.startsWith("http")
  ) {
    // Remove leading slash to avoid double slashes
    const cleanImagePath = ctaContent.backgroundImage.startsWith("/")
      ? ctaContent.backgroundImage.substring(1)
      : ctaContent.backgroundImage;
    ctaContent.backgroundImage = `${baseUrl}/${cleanImagePath}`;
  }

  return ctaContent;
};

// Get active CTA content
const getCTAContent = async (req, res) => {
  try {
    const ctaContent = await CTAContent.findOne({ isActive: true });
    if (!ctaContent) {
      // Return default content if none exists
      return res.json({
        title: "Ready to Start Your Journey?",
        description:
          "Join thousands of happy travelers who have discovered amazing destinations with Paradise Yatra. Your next adventure is just a click away!",
        backgroundImage:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        buttonText: "Start Your Journey",
        buttonLink: "/packages",
      });
    }

    // Transform image URL
    const transformedCTAContent = transformCTAImageUrl(ctaContent, req);

    res.json(transformedCTAContent);
  } catch (error) {
    console.error("Get CTA content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create CTA content (Admin only)
const createCTAContent = async (req, res) => {
  try {
    // Deactivate existing CTA content
    await CTAContent.updateMany({}, { isActive: false });

    const ctaContent = new CTAContent(req.body);
    await ctaContent.save();

    // Transform image URL
    const transformedCTAContent = transformCTAImageUrl(ctaContent, req);

    res.status(201).json(transformedCTAContent);
  } catch (error) {
    console.error("Create CTA content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update CTA content (Admin only)
const updateCTAContent = async (req, res) => {
  try {
    const ctaContent = await CTAContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ctaContent) {
      return res.status(404).json({ message: "CTA content not found" });
    }

    // Transform image URL
    const transformedCTAContent = transformCTAImageUrl(ctaContent, req);

    res.json(transformedCTAContent);
  } catch (error) {
    console.error("Update CTA content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete CTA content (Admin only)
const deleteCTAContent = async (req, res) => {
  try {
    const ctaContent = await CTAContent.findByIdAndDelete(req.params.id);
    if (!ctaContent) {
      return res.status(404).json({ message: "CTA content not found" });
    }
    res.json({ message: "CTA content deleted successfully" });
  } catch (error) {
    console.error("Delete CTA content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCTAContent,
  createCTAContent,
  updateCTAContent,
  deleteCTAContent,
};
