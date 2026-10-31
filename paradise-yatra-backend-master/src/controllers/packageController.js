const Package = require("../models/Package");
const { PACKAGE_CATEGORIES, TOUR_TYPES } = require("../config/categories");
const { processImageUrls } = require("../utils/imageUtils");
const axios = require("axios");

// Helper function to transform image paths to full URLs
const transformImageUrls = (packages) => {
  return packages.map((pkg) => {
    if (pkg.images && Array.isArray(pkg.images)) {
      pkg.images = processImageUrls(pkg.images);
    }
    return pkg;
  });
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Helper function to generate unique slug
const generateUniqueSlug = async (title) => {
  let slug = generateSlug(title);
  let counter = 1;
  let uniqueSlug = slug;

  while (await Package.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Get all packages
const getAllPackages = async (req, res) => {
  try {
    const {
      category,
      featured,
      tourType,
      country,
      state,
      holidayType,
      limit = 10,
      page = 1,
    } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
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
      // For international tours, if state matches country name, search by country instead
      if (tourType === "international") {
        // Check if state parameter matches any country name
        const countryMatch = { $regex: new RegExp(state, "i") };
        query.$or = [{ state: countryMatch }, { country: countryMatch }];
      } else {
        query.state = { $regex: new RegExp(state, "i") };
      }
    }

    if (holidayType) {
      query.holidayType = holidayType;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get packages error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single package
const getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Transform image URLs
    const transformedPackage = transformImageUrls([package])[0];

    res.json(transformedPackage);
  } catch (error) {
    console.error("Get package error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create package (Admin only)
const createPackage = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "shortDescription",
      "price",
      "duration",
      "destination",
      "category",
      "country",
      "tourType",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate category
    if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(
          ", "
        )}`,
      });
    }

    // Validate tour type
    if (!TOUR_TYPES.includes(req.body.tourType)) {
      return res.status(400).json({
        message: `Invalid tour type. Must be one of: ${TOUR_TYPES.join(", ")}`,
      });
    }

    // Validate price
    if (req.body.price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    // Generate unique slug if not provided
    if (!req.body.slug) {
      req.body.slug = await generateUniqueSlug(req.body.title);
    } else {
      // Check if provided slug is unique
      const existingPackage = await Package.findOne({ slug: req.body.slug });
      if (existingPackage) {
        return res.status(400).json({
          message: "Slug already exists. Please choose a different one.",
        });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const package = new Package(req.body);
    await package.save();

    // Transform image URLs
    const transformedPackage = transformImageUrls([package])[0];

    res.status(201).json({
      message: "Package created successfully",
      package: transformedPackage,
    });
  } catch (error) {
    console.error("Create package error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during package creation." });
  }
};

// Update package (Admin only)
const updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;

    // Check if package exists
    const existingPackage = await Package.findById(packageId);
    if (!existingPackage) {
      return res.status(404).json({ message: "Package not found." });
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

    // Validate price if provided
    if (req.body.price !== undefined && req.body.price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    // Generate slug if missing or if title has changed
    if (
      !req.body.slug ||
      (req.body.title && req.body.title !== existingPackage.title)
    ) {
      req.body.slug = await generateUniqueSlug(
        req.body.title || existingPackage.title
      );
    } else if (req.body.slug) {
      // Check if provided slug is unique (excluding current package)
      const existingPackageWithSlug = await Package.findOne({
        slug: req.body.slug,
        _id: { $ne: packageId },
      });
      if (existingPackageWithSlug) {
        return res.status(400).json({
          message: "Slug already exists. Please choose a different one.",
        });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        return `${baseUrl}/${file.path}`;
      });
    }

    // Handle single image upload if present
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const package = await Package.findByIdAndUpdate(packageId, req.body, {
      new: true,
      runValidators: true,
    });

    // Transform image URLs
    const transformedPackage = transformImageUrls([package])[0];

    res.json({
      message: "Package updated successfully",
      package: transformedPackage,
    });
  } catch (error) {
    console.error("Update package error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during package update." });
  }
};

// Delete package (Admin only)
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({ message: "Package not found." });
    }

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Delete package error:", error);
    res.status(500).json({ message: "Server error during package deletion." });
  }
};

// Get packages by category
const getPackagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 6 } = req.query;

    const packages = await Package.find({
      category,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json(transformedPackages);
  } catch (error) {
    console.error("Get packages by category error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Search packages
const searchPackages = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;

    let query = { isActive: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { destination: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const packages = await Package.find(query).sort({ createdAt: -1 });

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json(transformedPackages);
  } catch (error) {
    console.error("Search packages error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Add review to package
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const package = await Package.findById(req.params.id);

    if (!package) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Check if user already reviewed
    const existingReview = package.reviews.find(
      (review) => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this package." });
    }

    package.reviews.push({
      user: req.user.id,
      rating,
      comment,
    });

    // Update average rating
    const totalRating = package.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    package.rating = totalRating / package.reviews.length;

    await package.save();

    res.json({
      message: "Review added successfully",
      package,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ message: "Server error during review addition." });
  }
};

// Get package by slug
const getPackageBySlug = async (req, res) => {
  try {
    const package = await Package.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!package) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Transform image URLs
    const transformedPackage = transformImageUrls([package])[0];

    res.json(transformedPackage);
  } catch (error) {
    console.error("Get package by slug error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Suggest packages for search dropdown
const suggestPackages = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const searchQuery = q.trim();

    // Validate search query length
    if (searchQuery.length < 2) {
      return res.json({ suggestions: [] });
    }

    // First, try to find exact matches in countries and states using external API
    let locationMatches = [];
    try {
      const apiKey = process.env.NEXT_PUBLIC_COUNTRY_API;

      if (apiKey) {
        // Search in countries
        const countriesResponse = await axios.get(
          "https://api.countrystatecity.in/v1/countries",
          {
            headers: { "X-CSCAPI-KEY": apiKey },
          }
        );

        const matchingCountries = countriesResponse.data.filter(
          (country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.iso2.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.iso3.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // For matching countries, get their states
        for (const country of matchingCountries.slice(0, 3)) {
          try {
            const statesResponse = await axios.get(
              `https://api.countrystatecity.in/v1/countries/${country.iso2}/states`,
              {
                headers: { "X-CSCAPI-KEY": apiKey },
              }
            );

            const matchingStates = statesResponse.data.filter(
              (state) =>
                state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                state.state_code
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );

            locationMatches.push({
              type: "country",
              name: country.name,
              iso2: country.iso2,
              emoji: country.emoji,
              states: matchingStates.slice(0, 5),
            });
          } catch (stateError) {
            console.log(
              `Could not fetch states for ${country.name}:`,
              stateError.message
            );
          }
        }
      }
    } catch (locationError) {
      console.log("Location API error (non-critical):", locationError.message);
    }

    // Create case-insensitive search query for packages
    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { destination: { $regex: searchQuery, $options: "i" } },
            { country: { $regex: searchQuery, $options: "i" } },
            { state: { $regex: searchQuery, $options: "i" } },
          ],
        },
        // Ensure required fields exist and are not null/undefined
        { title: { $exists: true, $ne: null, $ne: "" } },
        { destination: { $exists: true, $ne: null, $ne: "" } },
      ],
    };

    console.log("Search query:", searchQuery);
    console.log("MongoDB query:", JSON.stringify(query));

    // Find packages with relevance scoring
    const packages = await Package.find(query)
      .select(
        "title description destination price duration category slug images country state tourType"
      )
      .limit(15)
      .lean(); // Use lean() for better performance

    console.log(`Found ${packages.length} packages matching query`);

    // Score and sort packages by relevance
    const scoredPackages = packages.map((pkg) => {
      try {
        let score = 0;
        const searchLower = searchQuery.toLowerCase();

        // Title match (highest priority)
        if (pkg.title && typeof pkg.title === "string") {
          if (pkg.title.toLowerCase().includes(searchLower)) {
            score += 20;
            // Exact title match gets bonus
            if (pkg.title.toLowerCase() === searchLower) {
              score += 10;
            }
          }
        }

        // Destination match (high priority)
        if (pkg.destination && typeof pkg.destination === "string") {
          if (pkg.destination.toLowerCase().includes(searchLower)) {
            score += 15;
          }
        }

        // Country match (high priority)
        if (pkg.country && typeof pkg.country === "string") {
          if (pkg.country.toLowerCase().includes(searchLower)) {
            score += 12;
          }
        }

        // State match (medium priority)
        if (pkg.state && typeof pkg.state === "string") {
          if (pkg.state.toLowerCase().includes(searchLower)) {
            score += 10;
          }
        }

        // Description match (lower priority)
        if (pkg.description && typeof pkg.description === "string") {
          if (pkg.description.toLowerCase().includes(searchLower)) {
            score += 5;
          }
        }

        return { ...pkg, score };
      } catch (err) {
        console.error("Error processing package:", pkg._id, err);
        return { ...pkg, score: 0 };
      }
    });

    // Sort packages by score (descending)
    const sortedPackages = scoredPackages
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 8);

    // Create suggestions combining location matches and packages
    const suggestions = [];

    // Add location-based suggestions first
    locationMatches.forEach((location) => {
      if (location.type === "country") {
        suggestions.push({
          id: `country_${location.iso2}`,
          title: `${location.emoji} ${location.name}`,
          destination: location.name,
          price: 0,
          duration: "N/A",
          category: "location",
          slug: `country/${location.iso2}`,
          image: null,
          type: "country",
          iso2: location.iso2,
          states: location.states,
        });
      }
    });

    // Add package suggestions
    const packageSuggestions = sortedPackages.map((pkg) => ({
      id: pkg._id,
      title: pkg.title || "Untitled Package",
      destination: pkg.destination || "Unknown Destination",
      price: pkg.price || 0,
      duration: pkg.duration || "N/A",
      category: pkg.category || "holiday",
      slug: pkg.slug || "",
      image:
        pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0
          ? pkg.images[0]
          : null,
      country: pkg.country,
      state: pkg.state,
      tourType: pkg.tourType,
    }));

    suggestions.push(...packageSuggestions);

    // Limit total suggestions to 12
    const finalSuggestions = suggestions.slice(0, 12);

    console.log(
      `Returning ${finalSuggestions.length} suggestions (${locationMatches.length} locations, ${packageSuggestions.length} packages)`
    );
    res.json({ suggestions: finalSuggestions });
  } catch (error) {
    console.error("Suggest packages error:", error);
    console.error("Error stack:", error.stack);

    // Return empty suggestions instead of 500 error
    res.json({
      suggestions: [],
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Search temporarily unavailable",
    });
  }
};

// Get packages by tour type (international/india)
const getPackagesByTourType = async (req, res) => {
  try {
    const { tourType } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (tourType && ["international", "india"].includes(tourType)) {
      query.tourType = tourType;
    }

    const packages = await Package.find(query)
      .populate("holidayType", "title slug image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get packages by tour type error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get packages by country
const getPackagesByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (country) {
      query.country = { $regex: new RegExp(country, "i") };
    }

    const packages = await Package.find(query)
      .populate("holidayType", "title slug image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get packages by country error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get packages by holiday type
const getPackagesByHolidayType = async (req, res) => {
  try {
    const { holidayTypeId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (holidayTypeId) {
      query.holidayType = holidayTypeId;
    }

    const packages = await Package.find(query)
      .populate("holidayType", "title slug image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get packages by holiday type error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get packages by state
const getPackagesByState = async (req, res) => {
  try {
    const { state } = req.params;
    const { limit = 10, page = 1 } = req.query;

    let query = { isActive: true };

    if (state) {
      query.state = { $regex: new RegExp(state, "i") };
    }

    const packages = await Package.find(query)
      .populate("holidayType", "title slug image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    // Transform image URLs
    const transformedPackages = transformImageUrls(packages);

    res.json({
      packages: transformedPackages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get packages by state error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all countries available in packages
const getAvailableCountries = async (req, res) => {
  try {
    const countries = await Package.distinct("country", { isActive: true });
    res.json({ countries: countries.sort() });
  } catch (error) {
    console.error("Get available countries error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all tour types available in packages
const getAvailableTourTypes = async (req, res) => {
  try {
    const tourTypes = await Package.distinct("tourType", { isActive: true });
    res.json({ tourTypes: tourTypes.sort() });
  } catch (error) {
    console.error("Get available tour types error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all states available in packages
const getAvailableStates = async (req, res) => {
  try {
    const states = await Package.distinct("state", {
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
  getAllPackages,
  getPackage,
  getPackageBySlug,
  createPackage,
  updatePackage,
  deletePackage,
  getPackagesByCategory,
  searchPackages,
  addReview,
  suggestPackages,
  getPackagesByTourType,
  getPackagesByCountry,
  getPackagesByState,
  getPackagesByHolidayType,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates,
};
