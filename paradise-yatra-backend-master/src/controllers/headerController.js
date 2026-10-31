const HeaderContent = require("../models/HeaderContent");

// Helper function to transform image paths to full URLs
const transformHeaderImageUrl = (headerContent, req) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  if (headerContent.logo && !headerContent.logo.startsWith("http")) {
    // Remove leading slash to avoid double slashes
    const cleanImagePath = headerContent.logo.startsWith("/")
      ? headerContent.logo.substring(1)
      : headerContent.logo;
    headerContent.logo = `${baseUrl}/${cleanImagePath}`;
  }

  return headerContent;
};

// Get active header content
const getHeaderContent = async (req, res) => {
  try {
    const headerContent = await HeaderContent.findOne({ isActive: true });
    if (!headerContent) {
      // Return null if no header content exists
      return res.status(404).json({ message: "No header content found" });
    }

    // Transform image URL
    const transformedHeaderContent = transformHeaderImageUrl(
      headerContent,
      req
    );

    res.json(transformedHeaderContent);
  } catch (error) {
    console.error("Get header content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create header content (Admin only)
const createHeaderContent = async (req, res) => {
  try {
    // Deactivate existing header content
    await HeaderContent.updateMany({}, { isActive: false });

    const headerContent = new HeaderContent(req.body);
    await headerContent.save();

    // Transform image URL
    const transformedHeaderContent = transformHeaderImageUrl(
      headerContent,
      req
    );

    res.status(201).json(transformedHeaderContent);
  } catch (error) {
    console.error("Create header content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update header content (Admin only)
const updateHeaderContent = async (req, res) => {
  try {
    const headerContent = await HeaderContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!headerContent) {
      return res.status(404).json({ message: "Header content not found" });
    }

    // Transform image URL
    const transformedHeaderContent = transformHeaderImageUrl(
      headerContent,
      req
    );

    res.json(transformedHeaderContent);
  } catch (error) {
    console.error("Update header content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete header content (Admin only)
const deleteHeaderContent = async (req, res) => {
  try {
    const headerContent = await HeaderContent.findByIdAndDelete(req.params.id);
    if (!headerContent) {
      return res.status(404).json({ message: "Header content not found" });
    }
    res.json({ message: "Header content deleted successfully" });
  } catch (error) {
    console.error("Delete header content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all header content (Admin only)
const getAllHeaderContent = async (req, res) => {
  try {
    const headerContents = await HeaderContent.find().sort({ createdAt: -1 });
    res.json(headerContents);
  } catch (error) {
    console.error("Get all header content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getHeaderContent,
  createHeaderContent,
  updateHeaderContent,
  deleteHeaderContent,
  getAllHeaderContent,
};
