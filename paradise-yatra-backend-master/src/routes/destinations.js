// const express = require('express');
// const router = express.Router();
// const { adminAuth } = require('../middleware/auth');
// const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
// const {
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
//   getAvailableStates
// } = require('../controllers/destinationController');

// // Public routes
// router.get('/', getAllDestinations);
// router.get('/trending', getTrendingDestinations);
// router.get('/search', searchDestinations);

// // New filtering routes
// router.get('/tour-type/:tourType', getDestinationsByTourType);
// router.get('/country/:country', getDestinationsByCountry);
// router.get('/state/:state', getDestinationsByState);

// // Utility routes for available options
// router.get('/countries', getAvailableCountries);
// router.get('/tour-types', getAvailableTourTypes);
// router.get('/states', getAvailableStates);

// router.get('/:id', getDestination);

// // Admin routes
// router.post('/', adminAuth, uploadSingleImage, handleUploadError, createDestination);
// router.put('/:id', adminAuth, uploadSingleImage, handleUploadError, updateDestination);
// router.delete('/:id', adminAuth, deleteDestination);

// module.exports = router; 

const express = require('express');
const router = express.Router();
const Destination = require("../models/Destination");
const { adminAuth } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const { uploadToCloudinary, extractPublicId, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const {
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
} = require('../controllers/destinationController');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug, existingId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (existingId) {
      query._id = { $ne: existingId };
    }

    const existing = await Destination.findOne(query);
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// Public routes
router.get('/', getAllDestinations);
router.get('/trending', getTrendingDestinations);
router.get('/search', searchDestinations);
router.get('/tour-type/:tourType', getDestinationsByTourType);
router.get('/country/:country', getDestinationsByCountry);
router.get('/state/:state', getDestinationsByState);
router.get('/countries', getAvailableCountries);
router.get('/tour-types', getAvailableTourTypes);
router.get('/states', getAvailableStates);
router.get('/:id', getDestination);

// ✅ CREATE Destination - MUST upload to paradise-yatra/packages/popular-packages
router.post('/', adminAuth, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    console.log('POST /destinations - Creating destination');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      name,
      slug,
      description,
      shortDescription,
      location,
      country,
      state,
      tourType,
      category,
      rating,
      price,
      duration,
      highlights,
      isActive,
      isTrending
    } = req.body;

    // Validate required fields
    if (!name || !description || !shortDescription || !location || !country || !tourType || !category) {
      return res.status(400).json({
        message: 'Missing required fields. Please fill in all required fields.'
      });
    }

    // Image is required (either via file upload or body URL)
    let imageUrl = req.body.image;

    if (req.file) {
      console.log('📁 File upload detected');
      const result = await uploadToCloudinary(req.file.path, 'popular-packages');
      console.log('✅ Upload result:', result);
      imageUrl = result.url;
    }

    if (!imageUrl) {
      return res.status(400).json({
        message: 'Destination image is required (file or URL)'
      });
    }

    // If imageUrl is from Cloudinary, verify the folder
    if (imageUrl.includes('cloudinary.com') && !imageUrl.includes('paradise-yatra/packages/popular-packages')) {
      console.warn('⚠️ Warning: Image might be in wrong Cloudinary folder or external URL:', imageUrl);
    }


    // Parse highlights if it's a string
    const parsedHighlights = typeof highlights === 'string'
      ? highlights.split(',').map(h => h.trim()).filter(h => h)
      : Array.isArray(highlights) ? highlights : [];

    // Generate unique slug
    const baseSlug = slug || generateSlug(name);
    const uniqueSlug = await ensureUniqueSlug(baseSlug);

    // Prepare destination data
    const destinationData = {
      name,
      slug: uniqueSlug,
      description,
      shortDescription,
      image: imageUrl,
      location,
      country,
      state: state || '',
      tourType,
      category,
      rating: rating ? parseFloat(rating) : 0,
      price: price ? parseFloat(price) : 0,
      duration: duration || '',
      highlights: parsedHighlights,
      isActive: isActive === 'true' || isActive === true,
      isTrending: isTrending === 'true' || isTrending === true,
    };

    const newDestination = await Destination.create(destinationData);
    console.log('✅ Destination created successfully:', newDestination._id);
    console.log('✅ Image stored:', newDestination.image);

    res.status(201).json({
      message: 'Destination created successfully',
      destination: newDestination
    });
  } catch (error) {
    console.error("❌ Create destination error:", error);
    res.status(500).json({ message: error.message || 'Failed to create destination' });
  }
});

// ✅ UPDATE Destination - MUST upload to paradise-yatra/packages/popular-packages
router.put('/:id', adminAuth, uploadSingleImage, handleUploadError, async (req, res) => {
  try {
    console.log('PUT /destinations/:id - Updating destination:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      location,
      country,
      state,
      tourType,
      category,
      rating,
      price,
      duration,
      highlights,
      itinerary,      // ✅ NEW - Itinerary array
      inclusions,      // ✅ NEW - Inclusions array
      exclusions,      // ✅ NEW - Exclusions array
      isActive,
      isTrending,
      image // ✅ Accept image URL from body
    } = req.body;


    // Update fields
    if (name) destination.name = name;
    if (description) destination.description = description;
    if (shortDescription) destination.shortDescription = shortDescription;
    if (location) destination.location = location;
    if (country) destination.country = country;
    if (state !== undefined) destination.state = state;
    if (tourType) destination.tourType = tourType;
    if (category) destination.category = category;
    if (rating !== undefined) destination.rating = parseFloat(rating);
    if (price !== undefined) destination.price = parseFloat(price);
    if (duration !== undefined) destination.duration = duration;

    if (highlights) {
      destination.highlights = typeof highlights === 'string'
        ? highlights.split(',').map(h => h.trim()).filter(h => h)
        : Array.isArray(highlights) ? highlights : [];
    }
    // ✅ Handle itinerary
    if (itinerary !== undefined) {
      destination.itinerary = typeof itinerary === 'string'
        ? JSON.parse(itinerary)
        : Array.isArray(itinerary)
          ? itinerary
          : [];
      console.log('✅ Updated destination itinerary:', destination.itinerary?.length || 0, 'days');
    }
    // ✅ Handle inclusions
    if (inclusions !== undefined) {
      destination.inclusions = typeof inclusions === 'string'
        ? JSON.parse(inclusions)
        : Array.isArray(inclusions)
          ? inclusions
          : [];
      console.log('✅ Updated destination inclusions:', destination.inclusions?.length || 0, 'items');
    }
    // ✅ Handle exclusions
    if (exclusions !== undefined) {
      destination.exclusions = typeof exclusions === 'string'
        ? JSON.parse(exclusions)
        : Array.isArray(exclusions)
          ? exclusions
          : [];
      console.log('✅ Updated destination exclusions:', destination.exclusions?.length || 0, 'items');
    }

    if (isActive !== undefined) {
      destination.isActive = isActive === 'true' || isActive === true;
    }
    if (isTrending !== undefined) {
      destination.isTrending = isTrending === 'true' || isTrending === true;
    }

    // Update slug if name changed
    if (slug || (name && name !== destination.name)) {
      const baseSlug = slug || generateSlug(name);
      destination.slug = await ensureUniqueSlug(baseSlug, req.params.id);
    }

    // ✅ Handle image update
    if (req.file) {
      console.log('🔥 New image detected for update (file)');
      const oldPublicId = destination.image ? extractPublicId(destination.image) : null;
      const result = await uploadToCloudinary(req.file.path, 'popular-packages', null, oldPublicId);
      destination.image = result.url;
    } else if (image) {
      console.log('🔥 New image detected for update (URL)');
      destination.image = image;
    }


    await destination.save();
    console.log('✅ Destination saved successfully with ID:', destination._id);
    console.log('✅ Destination itinerary count:', destination.itinerary?.length || 0);
    console.log('✅ Destination inclusions count:', destination.inclusions?.length || 0);
    console.log('✅ Destination exclusions count:', destination.exclusions?.length || 0);
    console.log('✅ Current image:', destination.image);

    res.json({
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    console.error("❌ Update destination error:", error);
    res.status(500).json({ message: error.message || 'Failed to update destination' });
  }
});

// ✅ DELETE with Cloudinary cleanup
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log('DELETE /destinations/:id - Deleting destination:', req.params.id);

    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // Delete image from Cloudinary if exists
    if (destination.image) {
      const publicId = extractPublicId(destination.image);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log('✅ Image deleted from Cloudinary:', publicId);
        } catch (deleteError) {
          console.error('❌ Failed to delete image from Cloudinary:', deleteError);
          // Continue with deletion even if Cloudinary delete fails
        }
      }
    }

    await Destination.findByIdAndDelete(req.params.id);
    console.log('✅ Destination deleted successfully');

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("❌ Delete destination error:", error);
    res.status(500).json({ message: error.message || 'Failed to delete destination' });
  }
});

module.exports = router;