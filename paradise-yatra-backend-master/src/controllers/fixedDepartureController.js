const FixedDeparture = require("../models/FixedDeparture");
const { PACKAGE_CATEGORIES, TOUR_TYPES } = require("../config/categories");
const { processImageUrls, processSingleImage } = require("../utils/imageUtils");

// Get all fixed departures
const getAllFixedDepartures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      featured,
      tourType,
      country,
      state,
      category,
      holidayType,
    } = req.query;

    const query = { isActive: true };

    if (status) {
      query.status = status;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (tourType && ["international", "india"].includes(tourType)) {
      query.tourType = tourType;
    }

    if (country) {
      query.country = { $regex: new RegExp(country, "i") };
    }

    if (state) {
      query.state = { $regex: new RegExp(state, "i") };
    }

    if (category) {
      query.category = category;
    }

    if (holidayType) {
      query.holidayType = holidayType;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { departureDate: 1 },
    };

    const fixedDepartures = await FixedDeparture.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const count = await FixedDeparture.countDocuments(query);

    // Process image URLs for each fixed departure
    const processedFixedDepartures = fixedDepartures.map((departure) => {
      const departureObj = departure.toObject();

      // Process main images
      if (departureObj.images) {
        departureObj.images = processImageUrls(departureObj.images);
      }

      // Process itinerary images
      if (departureObj.itinerary && Array.isArray(departureObj.itinerary)) {
        departureObj.itinerary = departureObj.itinerary.map((day) => ({
          ...day,
          image: processSingleImage(day.image),
        }));
      }

      return departureObj;
    });

    res.json({
      fixedDepartures: processedFixedDepartures,
      totalPages: Math.ceil(count / options.limit),
      currentPage: options.page,
      total: count,
    });
  } catch (error) {
    console.error("Error fetching fixed departures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get fixed departure by ID
const getFixedDeparture = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);

    if (!fixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    // Process image URLs
    const departureObj = fixedDeparture.toObject();

    if (departureObj.images) {
      departureObj.images = processImageUrls(departureObj.images);
    }

    if (departureObj.itinerary && Array.isArray(departureObj.itinerary)) {
      departureObj.itinerary = departureObj.itinerary.map((day) => ({
        ...day,
        image: processSingleImage(day.image),
      }));
    }

    res.json(departureObj);
  } catch (error) {
    console.error("Error fetching fixed departure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get fixed departure by slug
const getFixedDepartureBySlug = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!fixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    // Process image URLs
    const departureObj = fixedDeparture.toObject();

    if (departureObj.images) {
      departureObj.images = processImageUrls(departureObj.images);
    }

    if (departureObj.itinerary && Array.isArray(departureObj.itinerary)) {
      departureObj.itinerary = departureObj.itinerary.map((day) => ({
        ...day,
        image: processSingleImage(day.image),
      }));
    }

    res.json(departureObj);
  } catch (error) {
    console.error("Error fetching fixed departure by slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new fixed departure
const createFixedDeparture = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      holidayType,
      country,
      state,
      tourType,
      category,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      terms,
      images,
      isActive,
      isFeatured,
      status,
      departures,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "shortDescription",
      "price",
      "duration",
      "destination",
      "country",
      "tourType",
      "category",
    ];
    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate tour type
    if (!TOUR_TYPES.includes(req.body.tourType)) {
      return res.status(400).json({
        message: `Invalid tour type. Must be one of: ${TOUR_TYPES.join(", ")}`,
      });
    }

    // Validate category
    if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(
          ", "
        )}`,
      });
    }

    // Check if slug already exists
    const existingFixedDeparture = await FixedDeparture.findOne({ slug });
    if (existingFixedDeparture) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const fixedDeparture = new FixedDeparture({
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      holidayType,
      country,
      state,
      tourType,
      category,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights: highlights || [],
      itinerary: itinerary || [],
      inclusions: inclusions || [],
      exclusions: exclusions || [],
      terms: terms || [],
      images: images || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      status: status || 'upcoming',
      departures: departures || [],
    });

    await fixedDeparture.save();
    res.status(201).json(fixedDeparture);
  } catch (error) {
    console.error("Error creating fixed departure:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

// Update fixed departure
const updateFixedDeparture = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      discount,
      duration,
      destination,
      holidayType,
      country,
      state,
      tourType,
      category,
      departureDate,
      returnDate,
      availableSeats,
      totalSeats,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      terms,
      images,
      isActive,
      isFeatured,
      status,
      departures,
    } = req.body;

    // Validate tour type if provided
    if (req.body.tourType) {
      if (!TOUR_TYPES.includes(req.body.tourType)) {
        return res.status(400).json({
          message: `Invalid tour type. Must be one of: ${TOUR_TYPES.join(
            ", "
          )}`,
        });
      }
    }

    // Validate category if provided
    if (req.body.category) {
      if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
        return res.status(400).json({
          message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(
            ", "
          )}`,
        });
      }
    }

    // Check if slug already exists for other fixed departures
    if (slug) {
      const existingFixedDeparture = await FixedDeparture.findOne({
        slug,
        _id: { $ne: req.params.id },
      });
      if (existingFixedDeparture) {
        return res.status(400).json({ message: "Slug already exists" });
      }
    }

    const updatedFixedDeparture = await FixedDeparture.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        description,
        shortDescription,
        price,
        originalPrice,
        discount,
        duration,
        destination,
        holidayType,
        country,
        state,
        tourType,
        category,
        departureDate,
        returnDate,
        availableSeats,
        totalSeats,
        highlights,
        itinerary,
        inclusions,
        exclusions,
        terms,
        images,
        isActive,
        isFeatured,
        status,
        departures,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    res.json(updatedFixedDeparture);
  } catch (error) {
    console.error("Error updating fixed departure:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

// Delete fixed departure
const deleteFixedDeparture = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findByIdAndDelete(
      req.params.id
    );

    if (!fixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    res.json({ message: "Fixed departure deleted successfully" });
  } catch (error) {
    console.error("Error deleting fixed departure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);

    if (!fixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    fixedDeparture.isFeatured = !fixedDeparture.isFeatured;
    await fixedDeparture.save();

    res.json(fixedDeparture);
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle active status
const toggleStatus = async (req, res) => {
  try {
    const fixedDeparture = await FixedDeparture.findById(req.params.id);

    if (!fixedDeparture) {
      return res.status(404).json({ message: "Fixed departure not found" });
    }

    fixedDeparture.isActive = !fixedDeparture.isActive;
    await fixedDeparture.save();

    res.json(fixedDeparture);
  } catch (error) {
    console.error("Error toggling active status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get featured fixed departures
const getFeaturedFixedDepartures = async (req, res) => {
  try {
    const fixedDepartures = await FixedDeparture.find({
      isFeatured: true,
      isActive: true,
    })
      .sort({ departureDate: 1 })
      .limit(6);

    res.json(fixedDepartures);
  } catch (error) {
    console.error("Error fetching featured fixed departures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search fixed departures
const searchFixedDepartures = async (req, res) => {
  try {
    const {
      q,
      destination,
      status,
      minPrice,
      maxPrice,
      tourType,
      country,
      state,
      category,
    } = req.query;

    const query = { isActive: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { destination: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { state: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (tourType && ["international", "india"].includes(tourType)) {
      query.tourType = tourType;
    }

    if (country) {
      query.country = { $regex: new RegExp(country, "i") };
    }

    if (state) {
      query.state = { $regex: new RegExp(state, "i") };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const fixedDepartures = await FixedDeparture.find(query)
      .populate("holidayType", "title slug image")
      .sort({ departureDate: 1 })
      .limit(20);

    res.json(fixedDepartures);
  } catch (error) {
    console.error("Error searching fixed departures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get fixed departures by tour type
const getFixedDeparturesByTourType = async (req, res) => {
  try {
    const { tourType } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (tourType && ["international", "india"].includes(tourType)) {
      query.tourType = tourType;
    }

    const fixedDepartures = await FixedDeparture.find(query)
      .populate("holidayType", "title slug image")
      .sort({ departureDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FixedDeparture.countDocuments(query);

    res.json({
      fixedDepartures,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get fixed departures by tour type error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get fixed departures by country
const getFixedDeparturesByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (country) {
      query.country = { $regex: new RegExp(country, "i") };
    }

    const fixedDepartures = await FixedDeparture.find(query)
      .populate("holidayType", "title slug image")
      .sort({ departureDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FixedDeparture.countDocuments(query);

    res.json({
      fixedDepartures,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get fixed departures by country error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get fixed departures by state
const getFixedDeparturesByState = async (req, res) => {
  try {
    const { state } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (state) {
      query.state = { $regex: new RegExp(state, "i") };
    }

    const fixedDepartures = await FixedDeparture.find(query)
      .populate("holidayType", "title slug image")
      .sort({ departureDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FixedDeparture.countDocuments(query);

    res.json({
      fixedDepartures,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get fixed departures by state error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get available countries
const getAvailableCountries = async (req, res) => {
  try {
    const countries = await FixedDeparture.distinct("country", {
      isActive: true,
    });
    res.json({ countries: countries.sort() });
  } catch (error) {
    console.error("Get available countries error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get available tour types
const getAvailableTourTypes = async (req, res) => {
  try {
    const tourTypes = await FixedDeparture.distinct("tourType", {
      isActive: true,
    });
    res.json({ tourTypes: tourTypes.sort() });
  } catch (error) {
    console.error("Get available tour types error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get available states
const getAvailableStates = async (req, res) => {
  try {
    const states = await FixedDeparture.distinct("state", {
      isActive: true,
      state: { $exists: true, $ne: null, $ne: "" },
    });
    res.json({ states: states.sort() });
  } catch (error) {
    console.error("Get available states error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllFixedDepartures,
  getFixedDeparture,
  getFixedDepartureBySlug,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture,
  toggleFeatured,
  toggleStatus,
  getFeaturedFixedDepartures,
  searchFixedDepartures,
  getFixedDeparturesByTourType,
  getFixedDeparturesByCountry,
  getFixedDeparturesByState,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates,
};
