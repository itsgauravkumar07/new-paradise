// const Destination = require("../models/Destination");
// const { PACKAGE_CATEGORIES, TOUR_TYPES } = require("../config/categories");
// const { processSingleImage } = require("../utils/imageUtils");

// // Helper function to generate slug from name
// const generateSlug = (name) => {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
//     .replace(/\s+/g, "-") // Replace spaces with hyphens
//     .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
//     .trim("-"); // Remove leading/trailing hyphens
// };

// // Helper function to ensure unique slug
// const ensureUniqueSlug = async (baseSlug, existingId = null) => {
//   let slug = baseSlug;
//   let counter = 1;

//   while (true) {
//     const query = { slug };
//     if (existingId) {
//       query._id = { $ne: existingId };
//     }

//     const existing = await Destination.findOne(query);
//     if (!existing) {
//       return slug;
//     }

//     slug = `${baseSlug}-${counter}`;
//     counter++;
//   }
// };

// // Helper function to transform image paths to full URLs
// const transformDestinationImageUrl = (destination) => {
//   if (destination.image) {
//     destination.image = processSingleImage(destination.image);
//   }
//   return destination;
// };

// // Get all destinations
// const getAllDestinations = async (req, res) => {
//   try {
//     const {
//       trending,
//       limit = 10,
//       page = 1,
//       tourType,
//       country,
//       state,
//       category,
//       holidayType,
//     } = req.query;

//     let query = { isActive: true };

//     if (trending === "true") {
//       query.isTrending = true;
//     }

//     if (tourType && ["international", "india"].includes(tourType)) {
//       query.tourType = tourType;
//     }

//     if (country) {
//       query.country = { $regex: new RegExp(country, "i") };
//     }

//     if (state) {
//       // For international tours, if state matches country name, search by country instead
//       if (tourType === "international") {
//         // Check if state parameter matches any country name
//         const countryMatch = { $regex: new RegExp(state, "i") };
//         query.$or = [{ state: countryMatch }, { country: countryMatch }];
//       } else {
//         query.state = { $regex: new RegExp(state, "i") };
//       }
//     }

//     if (category) {
//       query.category = category;
//     }

//     if (holidayType) {
//       query.holidayType = holidayType;
//     }

//     let destinations = await Destination.find(query)
//       .sort({ createdAt: -1, visitCount: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     let total = await Destination.countDocuments(query);

//     // If no destinations found and looking for international packages, try to get packages
//     if (destinations.length === 0 && tourType === "international") {
//       const Package = require("../models/Package");
//       const packages = await Package.find({
//         isActive: true,
//         tourType: "international",
//         ...(state
//           ? {
//               $or: [
//                 { state: { $regex: new RegExp(state, "i") } },
//                 { country: { $regex: new RegExp(state, "i") } },
//               ],
//             }
//           : {}),
//       })
//         .sort({ createdAt: -1 })
//         .limit(parseInt(limit))
//         .skip((parseInt(page) - 1) * parseInt(limit));

//       const packageTotal = await Package.countDocuments({
//         isActive: true,
//         tourType: "international",
//         ...(state
//           ? {
//               $or: [
//                 { state: { $regex: new RegExp(state, "i") } },
//                 { country: { $regex: new RegExp(state, "i") } },
//               ],
//             }
//           : {}),
//       });

//       // Transform packages to destinations format
//       destinations = packages.map((pkg) => ({
//         _id: pkg._id,
//         name: pkg.title,
//         slug: pkg.slug,
//         description: pkg.description,
//         shortDescription: pkg.shortDescription,
//         image: pkg.images && pkg.images.length > 0 ? pkg.images[0] : pkg.image,
//         location: pkg.destination,
//         rating: pkg.rating || 0,
//         price: pkg.price,
//         duration: pkg.duration,
//         isActive: pkg.isActive,
//         isTrending: pkg.isFeatured || false,
//         visitCount: 0,
//         country: pkg.country,
//         state: pkg.state,
//         tourType: pkg.tourType,
//         category: pkg.category,
//       }));

//       total = packageTotal;
//     }

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json({
//       destinations: transformedDestinations,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / parseInt(limit)),
//         hasNext: parseInt(page) * parseInt(limit) < total,
//         hasPrev: parseInt(page) > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Get destinations error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get single destination
// const getDestination = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if it's a valid ObjectId (24 character hex string)
//     const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

//     let destination;
//     if (isObjectId) {
//       // Query by ObjectId
//       destination = await Destination.findById(id);
//     } else {
//       // Query by slug
//       destination = await Destination.findOne({ slug: id });
//     }

//     if (!destination) {
//       return res.status(404).json({ message: "Destination not found." });
//     }

//     // Increment visit count
//     destination.visitCount += 1;
//     await destination.save();

//     // Transform image URL
//     const transformedDestination = transformDestinationImageUrl(destination);

//     res.json(transformedDestination);
//   } catch (error) {
//     console.error("Get destination error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Create destination (Admin only)
// const createDestination = async (req, res) => {
//   try {
//     // Validate required fields
//     const requiredFields = [
//       "name",
//       "description",
//       "shortDescription",
//       "location",
//       "country",
//       "tourType",
//       "category",
//     ];
//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({ message: `${field} is required` });
//       }
//     }

//     // Validate tour type
//     const validTourTypes = ["international", "india"];
//     if (!validTourTypes.includes(req.body.tourType)) {
//       return res.status(400).json({
//         message: "Invalid tour type. Must be one of: international, india",
//       });
//     }

//     // Validate category
//     if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
//       return res.status(400).json({
//         message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(
//           ", "
//         )}`,
//       });
//     }

//     // Generate slug from name
//     const baseSlug = generateSlug(req.body.name);
//     req.body.slug = await ensureUniqueSlug(baseSlug);

//     // If image file is uploaded, use the uploaded file path
//     if (req.file) {
//       req.body.image = `/uploads/${req.file.filename}`;
//     }

//     const destination = new Destination(req.body);
//     await destination.save();

//     // Transform image URL
//     const transformedDestination = transformDestinationImageUrl(destination);

//     res.status(201).json({
//       message: "Destination created successfully",
//       destination: transformedDestination,
//     });
//   } catch (error) {
//     console.error("Create destination error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during destination creation." });
//   }
// };

// // Update destination (Admin only)
// const updateDestination = async (req, res) => {
//   try {
//     // Validate tour type if provided
//     if (req.body.tourType) {
//       if (!TOUR_TYPES.includes(req.body.tourType)) {
//         return res.status(400).json({
//           message: `Invalid tour type. Must be one of: ${TOUR_TYPES.join(
//             ", "
//           )}`,
//         });
//       }
//     }

//     // Validate category if provided
//     if (req.body.category) {
//       if (!PACKAGE_CATEGORIES.includes(req.body.category)) {
//         return res.status(400).json({
//           message: `Invalid category. Must be one of: ${PACKAGE_CATEGORIES.join(
//             ", "
//           )}`,
//         });
//       }
//     }

//     // Generate slug from name if name is being updated
//     if (req.body.name) {
//       const baseSlug = generateSlug(req.body.name);
//       req.body.slug = await ensureUniqueSlug(baseSlug, req.params.id);
//     }

//     // If image file is uploaded, use the uploaded file path
//     if (req.file) {
//       req.body.image = `/uploads/${req.file.filename}`;
//     }

//     const destination = await Destination.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!destination) {
//       return res.status(404).json({ message: "Destination not found." });
//     }

//     // Transform image URL
//     const transformedDestination = transformDestinationImageUrl(destination);

//     res.json({
//       message: "Destination updated successfully",
//       destination: transformedDestination,
//     });
//   } catch (error) {
//     console.error("Update destination error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during destination update." });
//   }
// };

// // Delete destination (Admin only)
// const deleteDestination = async (req, res) => {
//   try {
//     const destination = await Destination.findByIdAndDelete(req.params.id);

//     if (!destination) {
//       return res.status(404).json({ message: "Destination not found." });
//     }

//     res.json({ message: "Destination deleted successfully" });
//   } catch (error) {
//     console.error("Delete destination error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during destination deletion." });
//   }
// };

// // Get trending destinations
// const getTrendingDestinations = async (req, res) => {
//   try {
//     const { limit = 6, country, state, tourType } = req.query;

//     let query = {
//       isTrending: true,
//       isActive: true,
//     };

//     // Add filters if provided
//     if (country) {
//       query.country = { $regex: new RegExp(country, "i") };
//     }

//     if (state) {
//       // For international tours, if state matches country name, search by country instead
//       if (tourType === "international") {
//         // Check if state parameter matches any country name
//         const countryMatch = { $regex: new RegExp(state, "i") };
//         query.$or = [{ state: countryMatch }, { country: countryMatch }];
//       } else {
//         query.state = { $regex: new RegExp(state, "i") };
//       }
//     }

//     if (tourType && ["international", "india"].includes(tourType)) {
//       query.tourType = tourType;
//     }

//     const destinations = await Destination.find(query)
//       .sort({ createdAt: -1, visitCount: -1 })
//       .limit(parseInt(limit));

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json(transformedDestinations);
//   } catch (error) {
//     console.error("Get trending destinations error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Search destinations
// const searchDestinations = async (req, res) => {
//   try {
//     const { q, location, tourType, country, state, category } = req.query;

//     let query = { isActive: true };

//     if (q) {
//       query.$or = [
//         { name: { $regex: q, $options: "i" } },
//         { description: { $regex: q, $options: "i" } },
//         { country: { $regex: q, $options: "i" } },
//         { state: { $regex: q, $options: "i" } },
//       ];
//     }

//     if (location) {
//       query.location = { $regex: location, $options: "i" };
//     }

//     if (tourType && ["international", "india"].includes(tourType)) {
//       query.tourType = tourType;
//     }

//     if (country) {
//       query.country = { $regex: new RegExp(country, "i") };
//     }

//     if (state) {
//       // For international tours, if state matches country name, search by country instead
//       if (tourType === "international") {
//         // Check if state parameter matches any country name
//         const countryMatch = { $regex: new RegExp(state, "i") };
//         query.$or = [{ state: countryMatch }, { country: countryMatch }];
//       } else {
//         query.state = { $regex: new RegExp(state, "i") };
//       }
//     }

//     if (category) {
//       query.category = category;
//     }

//     const destinations = await Destination.find(query)
//       .populate("holidayType", "title slug image")
//       .sort({ visitCount: -1 });

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json(transformedDestinations);
//   } catch (error) {
//     console.error("Search destinations error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get destinations by tour type
// const getDestinationsByTourType = async (req, res) => {
//   try {
//     const { tourType } = req.params;
//     const { limit = 10, page = 1 } = req.query;

//     let query = { isActive: true };

//     if (tourType && ["international", "india"].includes(tourType)) {
//       query.tourType = tourType;
//     }

//     const destinations = await Destination.find(query)
//       .populate("holidayType", "title slug image")
//       .sort({ createdAt: -1, visitCount: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Destination.countDocuments(query);

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json({
//       destinations: transformedDestinations,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / parseInt(limit)),
//         hasNext: parseInt(page) * parseInt(limit) < total,
//         hasPrev: parseInt(page) > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Get destinations by tour type error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get destinations by country
// const getDestinationsByCountry = async (req, res) => {
//   try {
//     const { country } = req.params;
//     const { limit = 10, page = 1 } = req.query;

//     let query = { isActive: true };

//     if (country) {
//       query.country = { $regex: new RegExp(country, "i") };
//     }

//     const destinations = await Destination.find(query)
//       .populate("holidayType", "title slug image")
//       .sort({ createdAt: -1, visitCount: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Destination.countDocuments(query);

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json({
//       destinations: transformedDestinations,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / parseInt(limit)),
//         hasNext: parseInt(page) * parseInt(limit) < total,
//         hasPrev: parseInt(page) > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Get destinations by country error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get destinations by state
// const getDestinationsByState = async (req, res) => {
//   try {
//     const { state } = req.params;
//     const { limit = 10, page = 1 } = req.query;

//     let query = { isActive: true };

//     if (state) {
//       query.state = { $regex: new RegExp(state, "i") };
//     }

//     const destinations = await Destination.find(query)
//       .populate("holidayType", "title slug image")
//       .sort({ createdAt: -1, visitCount: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Destination.countDocuments(query);

//     // Transform image URLs
//     const transformedDestinations = destinations.map((dest) =>
//       transformDestinationImageUrl(dest)
//     );

//     res.json({
//       destinations: transformedDestinations,
//       pagination: {
//         current: parseInt(page),
//         total: Math.ceil(total / parseInt(limit)),
//         hasNext: parseInt(page) * parseInt(limit) < total,
//         hasPrev: parseInt(page) > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Get destinations by state error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get available countries
// const getAvailableCountries = async (req, res) => {
//   try {
//     const countries = await Destination.distinct("country", { isActive: true });
//     res.json({ countries: countries.sort() });
//   } catch (error) {
//     console.error("Get available countries error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get available tour types
// const getAvailableTourTypes = async (req, res) => {
//   try {
//     const tourTypes = await Destination.distinct("tourType", {
//       isActive: true,
//     });
//     res.json({ tourTypes: tourTypes.sort() });
//   } catch (error) {
//     console.error("Get available tour types error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Get available states
// const getAvailableStates = async (req, res) => {
//   try {
//     const states = await Destination.distinct("state", {
//       isActive: true,
//       state: { $exists: true, $ne: null, $ne: "" },
//     });
//     res.json({ states: states.sort() });
//   } catch (error) {
//     console.error("Get available states error:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// module.exports = {
//   getAllDestinations,
//   getDestination,
//   createDestination,
//   updateDestination,
//   deleteDestination,
//   getTrendingDestinations,
//   searchDestinations,
//   getDestinationsByTourType,
//   getDestinationsByCountry,
//   getDestinationsByState,
//   getAvailableCountries,
//   getAvailableTourTypes,
//   getAvailableStates,
// };


const Destination = require("../models/Destination");

// Get all destinations with filters
const getAllDestinations = async (req, res) => {
  try {
    const { tourType, state, country, category, limit, isActive, isTrending } = req.query;

    const filter = {};

    if (tourType) filter.tourType = tourType;
    if (state) filter.state = state;
    if (country) filter.country = country;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isTrending !== undefined) filter.isTrending = isTrending === 'true';

    const limitNum = limit ? parseInt(limit) : 100;

    const destinations = await Destination.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Get all destinations error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch destinations' });
  }
};

// Get single destination by ID or slug
const getDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a valid ObjectId (24 character hex string)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    let destination;
    if (isObjectId) {
      // Query by ObjectId
      destination = await Destination.findById(id);
    } else {
      // Query by slug
      destination = await Destination.findOne({ slug: id });
    }

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // Increment visit count
    destination.visitCount = (destination.visitCount || 0) + 1;
    await destination.save();

    res.json({ destination });
  } catch (error) {
    console.error("Get destination error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch destination' });
  }
};

// Get trending destinations
const getTrendingDestinations = async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 10;

    const destinations = await Destination.find({
      isTrending: true,
      isActive: true
    })
      .sort({ visitCount: -1, rating: -1 })
      .limit(limitNum);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Get trending destinations error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch trending destinations' });
  }
};

// Search destinations
const searchDestinations = async (req, res) => {
  try {
    const { q, tourType, country, minPrice, maxPrice } = req.query;

    const filter = { isActive: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { highlights: { $regex: q, $options: 'i' } }
      ];
    }

    if (tourType) filter.tourType = tourType;
    if (country) filter.country = country;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const destinations = await Destination.find(filter)
      .sort({ rating: -1, visitCount: -1 })
      .limit(50);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Search destinations error:", error);
    res.status(500).json({ message: error.message || 'Failed to search destinations' });
  }
};

// Get destinations by tour type
const getDestinationsByTourType = async (req, res) => {
  try {
    const { tourType } = req.params;
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 50;

    const destinations = await Destination.find({
      tourType,
      isActive: true
    })
      .sort({ rating: -1, visitCount: -1 })
      .limit(limitNum);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Get destinations by tour type error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch destinations' });
  }
};

// Get destinations by country
const getDestinationsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 50;

    const destinations = await Destination.find({
      country,
      isActive: true
    })
      .sort({ rating: -1, visitCount: -1 })
      .limit(limitNum);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Get destinations by country error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch destinations' });
  }
};

// Get destinations by state
const getDestinationsByState = async (req, res) => {
  try {
    const { state } = req.params;
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit) : 50;

    const destinations = await Destination.find({
      state,
      isActive: true
    })
      .sort({ rating: -1, visitCount: -1 })
      .limit(limitNum);

    res.json({ destinations, count: destinations.length });
  } catch (error) {
    console.error("Get destinations by state error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch destinations' });
  }
};

// Get available countries
const getAvailableCountries = async (req, res) => {
  try {
    const countries = await Destination.distinct('country', { isActive: true });
    res.json({ countries: countries.filter(c => c).sort() });
  } catch (error) {
    console.error("Get available countries error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch countries' });
  }
};

// Get available tour types
const getAvailableTourTypes = async (req, res) => {
  try {
    const tourTypes = await Destination.distinct('tourType', { isActive: true });
    res.json({ tourTypes: tourTypes.filter(t => t).sort() });
  } catch (error) {
    console.error("Get available tour types error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch tour types' });
  }
};

// Get available states
const getAvailableStates = async (req, res) => {
  try {
    const { country } = req.query;

    const filter = { isActive: true };
    if (country) filter.country = country;

    const states = await Destination.distinct('state', filter);
    res.json({ states: states.filter(s => s).sort() });
  } catch (error) {
    console.error("Get available states error:", error);
    res.status(500).json({ message: error.message || 'Failed to fetch states' });
  }
};

module.exports = {
  getAllDestinations,
  getDestination,
  getTrendingDestinations,
  searchDestinations,
  getDestinationsByTourType,
  getDestinationsByCountry,
  getDestinationsByState,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates
};