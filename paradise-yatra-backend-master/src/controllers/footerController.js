const FooterContent = require("../models/FooterContent");

// Get footer content
const getFooterContent = async (req, res) => {
  try {
    // Clean up any duplicate inactive footers first
    const allFooters = await FooterContent.find().sort({ createdAt: -1 });
    if (allFooters.length > 1) {
      const activeFooter = allFooters.find((footer) => footer.isActive);
      if (activeFooter) {
        // Delete all other footers except the active one
        await FooterContent.deleteMany({ _id: { $ne: activeFooter._id } });
      } else {
        // If no active footer, keep only the most recent one and make it active
        const mostRecentFooter = allFooters[0];
        await FooterContent.deleteMany({ _id: { $ne: mostRecentFooter._id } });
        mostRecentFooter.isActive = true;
        await mostRecentFooter.save();
      }
    }

    let footerContent = await FooterContent.findOne({ isActive: true });

    if (!footerContent) {
      // Create default footer content if none exists
      const defaultContent = FooterContent.getDefaultContent();
      footerContent = await FooterContent.create(defaultContent);
    }

    res.json(footerContent);
  } catch (error) {
    console.error("Get footer content error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all footer content (Admin)
const getAllFooterContent = async (req, res) => {
  try {
    const footerContent = await FooterContent.find().sort({ createdAt: -1 });
    res.json(footerContent);
  } catch (error) {
    console.error("Get all footer content error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create footer content (Admin)
const createFooterContent = async (req, res) => {
  try {
    const { companyInfo, links, socialMedia } = req.body;

    // Deactivate all existing footer content
    await FooterContent.updateMany({}, { isActive: false });

    const footerContent = await FooterContent.create({
      companyInfo,
      links,
      socialMedia,
      isActive: true,
    });

    res.status(201).json(footerContent);
  } catch (error) {
    console.error("Create footer content error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update footer content (Admin)
const updateFooterContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyInfo, links, socialMedia, isActive } = req.body;

    let footerContent = await FooterContent.findById(id);

    if (!footerContent) {
      return res.status(404).json({ message: "Footer content not found." });
    }

    // Always set the updated footer as active and deactivate others
    await FooterContent.updateMany({ _id: { $ne: id } }, { isActive: false });

    footerContent.companyInfo = companyInfo || footerContent.companyInfo;
    footerContent.links = links || footerContent.links;
    footerContent.socialMedia = socialMedia || footerContent.socialMedia;
    footerContent.isActive = true; // Always set as active when updated

    await footerContent.save();

    // Also clean up any duplicate inactive footers
    await FooterContent.deleteMany({ isActive: false });

    res.json(footerContent);
  } catch (error) {
    console.error("Update footer content error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete footer content (Admin)
const deleteFooterContent = async (req, res) => {
  try {
    const { id } = req.params;

    const footerContent = await FooterContent.findById(id);

    if (!footerContent) {
      return res.status(404).json({ message: "Footer content not found." });
    }

    await FooterContent.findByIdAndDelete(id);

    res.json({ message: "Footer content deleted successfully." });
  } catch (error) {
    console.error("Delete footer content error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Toggle footer content status (Admin)
const toggleFooterContentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const footerContent = await FooterContent.findById(id);

    if (!footerContent) {
      return res.status(404).json({ message: "Footer content not found." });
    }

    // If activating this one, deactivate others
    if (!footerContent.isActive) {
      await FooterContent.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    footerContent.isActive = !footerContent.isActive;
    await footerContent.save();

    res.json(footerContent);
  } catch (error) {
    console.error("Toggle footer content status error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getFooterContent,
  getAllFooterContent,
  createFooterContent,
  updateFooterContent,
  deleteFooterContent,
  toggleFooterContentStatus,
};
