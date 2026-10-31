const FAQ = require("../models/FAQ");

// Get all FAQs with optional filtering
const getAllFAQs = async (req, res) => {
  try {
    const { location, isActive, limit = 50, skip = 0 } = req.query;

    let query = {};

    if (location) {
      query.location = location.toLowerCase().trim();
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      faqs,
      total: await FAQ.countDocuments(query),
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQs",
      error: error.message,
    });
  }
};

// Get FAQ by ID
const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      faq,
    });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQ",
      error: error.message,
    });
  }
};

// Create new FAQ
const createFAQ = async (req, res) => {
  try {
    const { question, answer, location, isActive = true, order = 1 } = req.body;

    if (!question || !answer || !location) {
      return res.status(400).json({
        success: false,
        message: "Question, answer, and location are required",
      });
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      location: location.toLowerCase().trim(),
      isActive,
      order,
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error creating FAQ",
      error: error.message,
    });
  }
};

// Update FAQ
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, location, isActive, order } = req.body;

    const updateData = {};

    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (location !== undefined)
      updateData.location = location.toLowerCase().trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const faq = await FAQ.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ updated successfully",
      faq,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error updating FAQ",
      error: error.message,
    });
  }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting FAQ",
      error: error.message,
    });
  }
};

// Reorder FAQ
const reorderFAQ = async (req, res) => {
  try {
    const { id, newOrder } = req.body;

    if (!id || !newOrder) {
      return res.status(400).json({
        success: false,
        message: "ID and new order are required",
      });
    }

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { order: newOrder },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    res.json({
      success: true,
      message: "FAQ reordered successfully",
      faq,
    });
  } catch (error) {
    console.error("Error reordering FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error reordering FAQ",
      error: error.message,
    });
  }
};

// Get all unique locations
const getLocations = async (req, res) => {
  try {
    const locations = await FAQ.distinct("location");

    res.json({
      success: true,
      locations: locations.sort(),
    });
  } catch (error) {
    console.error("Error fetching FAQ locations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQ locations",
      error: error.message,
    });
  }
};

// Get FAQ statistics
const getFAQStats = async (req, res) => {
  try {
    const totalFAQs = await FAQ.countDocuments();
    const activeFAQs = await FAQ.countDocuments({ isActive: true });
    const inactiveFAQs = await FAQ.countDocuments({ isActive: false });
    const uniqueLocations = await FAQ.distinct("location");

    const locationStats = await FAQ.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ["$isActive", 1, 0] },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      stats: {
        total: totalFAQs,
        active: activeFAQs,
        inactive: inactiveFAQs,
        locations: uniqueLocations.length,
        locationBreakdown: locationStats,
      },
    });
  } catch (error) {
    console.error("Error fetching FAQ stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching FAQ stats",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQ,
  getLocations,
  getFAQStats,
};
