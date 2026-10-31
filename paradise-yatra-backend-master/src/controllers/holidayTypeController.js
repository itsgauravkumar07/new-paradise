const HolidayType = require("../models/HolidayType");

// Get all holiday types
const getAllHolidayTypes = async (req, res) => {
  try {
    const holidayTypes = await HolidayType.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(holidayTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching holiday types", error: error.message });
  }
};

// Get all holiday types (admin)
const getAllHolidayTypesAdmin = async (req, res) => {
  try {
    const holidayTypes = await HolidayType.find().sort({
      order: 1,
      createdAt: -1,
    });
    res.json(holidayTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching holiday types", error: error.message });
  }
};

// Get holiday type by ID
const getHolidayType = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    res.json(holidayType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching holiday type", error: error.message });
  }
};

// Get holiday type by slug
const getHolidayTypeBySlug = async (req, res) => {
  try {
    const holidayType = await HolidayType.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    res.json(holidayType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching holiday type", error: error.message });
  }
};

// Create new holiday type
const createHolidayType = async (req, res) => {
  try {
    console.log("Creating holiday type with data:", req.body);
    console.log("User making request:", req.user);

    // Generate slug from title if not provided
    const holidayData = { ...req.body };
    if (!holidayData.slug) {
      holidayData.slug = holidayData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const holidayType = new HolidayType(holidayData);
    await holidayType.save();
    console.log("Holiday type created successfully:", holidayType);
    res.status(201).json(holidayType);
  } catch (error) {
    console.error("Error creating holiday type:", error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Holiday type with this slug already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Error creating holiday type", error: error.message });
    }
  }
};

// Update holiday type
const updateHolidayType = async (req, res) => {
  try {
    // Generate slug from title if title is being updated and slug is not provided
    const updateData = { ...req.body };
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const holidayType = await HolidayType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    res.json(holidayType);
  } catch (error) {
    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Holiday type with this slug already exists" });
    } else {
      res
        .status(500)
        .json({ message: "Error updating holiday type", error: error.message });
    }
  }
};

// Delete holiday type
const deleteHolidayType = async (req, res) => {
  try {
    const holidayType = await HolidayType.findByIdAndDelete(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    res.json({ message: "Holiday type deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting holiday type", error: error.message });
  }
};

// Toggle holiday type active status
const toggleHolidayTypeStatus = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    holidayType.isActive = !holidayType.isActive;
    await holidayType.save();
    res.json(holidayType);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error toggling holiday type status",
        error: error.message,
      });
  }
};

// Toggle holiday type featured status
const toggleHolidayTypeFeatured = async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    holidayType.isFeatured = !holidayType.isFeatured;
    await holidayType.save();
    res.json(holidayType);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error toggling holiday type featured status",
        error: error.message,
      });
  }
};

// Update holiday type order
const updateHolidayTypeOrder = async (req, res) => {
  try {
    const { order } = req.body;
    const holidayType = await HolidayType.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true }
    );
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }
    res.json(holidayType);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating holiday type order",
        error: error.message,
      });
  }
};

// Search holiday types
const searchHolidayTypes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ holidayTypes: [] });
    }

    const searchQuery = q.trim();

    // Validate search query length
    if (searchQuery.length < 2) {
      return res.json({ holidayTypes: [] });
    }

    // Create case-insensitive search query for name and description
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { shortDescription: { $regex: searchQuery, $options: "i" } },
          ],
        },
        // Ensure required fields exist and are not null/undefined
        { name: { $exists: true, $ne: null, $ne: "" } },
      ],
    };

    console.log("Holiday type search query:", searchQuery);
    console.log("MongoDB query:", JSON.stringify(query));

    // Find holiday types with relevance scoring
    const holidayTypes = await HolidayType.find(query)
      .select("name description shortDescription isFeatured slug image")
      .limit(10)
      .lean();

    console.log(`Found ${holidayTypes.length} holiday types matching query`);

    if (!holidayTypes || holidayTypes.length === 0) {
      return res.json({ holidayTypes: [] });
    }

    // Score and sort by relevance
    const scoredHolidayTypes = holidayTypes.map((ht) => {
      try {
        let score = 0;
        const searchLower = searchQuery.toLowerCase();

        // Safely check name
        if (ht.name && typeof ht.name === "string") {
          if (ht.name.toLowerCase().includes(searchLower)) {
            score += 10;
            // Exact name match gets bonus
            if (ht.name.toLowerCase() === searchLower) {
              score += 5;
            }
          }
        }

        // Safely check description
        if (ht.description && typeof ht.description === "string") {
          if (ht.description.toLowerCase().includes(searchLower)) {
            score += 3;
          }
        }

        // Safely check short description
        if (ht.shortDescription && typeof ht.shortDescription === "string") {
          if (ht.shortDescription.toLowerCase().includes(searchLower)) {
            score += 2;
          }
        }

        return { ...ht, score };
      } catch (err) {
        console.error("Error processing holiday type:", ht._id, err);
        return { ...ht, score: 0 };
      }
    });

    // Sort by score (descending) and take top 5
    const suggestions = scoredHolidayTypes
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);

    console.log(`Returning ${suggestions.length} holiday type suggestions`);
    res.json({ holidayTypes: suggestions });
  } catch (error) {
    console.error("Search holiday types error:", error);
    console.error("Error stack:", error.stack);

    // Return empty suggestions instead of 500 error
    res.json({
      holidayTypes: [],
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Search temporarily unavailable",
    });
  }
};

module.exports = {
  getAllHolidayTypes,
  getAllHolidayTypesAdmin,
  getHolidayType,
  getHolidayTypeBySlug,
  createHolidayType,
  updateHolidayType,
  deleteHolidayType,
  toggleHolidayTypeStatus,
  toggleHolidayTypeFeatured,
  updateHolidayTypeOrder,
  searchHolidayTypes,
};
