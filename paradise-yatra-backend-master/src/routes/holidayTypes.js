const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const { uploadToCloudinary, extractPublicId, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const HolidayType = require('../models/HolidayType');
const {
  getAllHolidayTypes,
  getAllHolidayTypesAdmin,
  getHolidayType,
  getHolidayTypeBySlug,
  toggleHolidayTypeStatus,
  toggleHolidayTypeFeatured,
  updateHolidayTypeOrder,
  searchHolidayTypes
} = require('../controllers/holidayTypeController');

// Public routes
router.get('/', getAllHolidayTypes);
router.get('/search', searchHolidayTypes);
router.get('/slug/:slug', getHolidayTypeBySlug);
router.get('/:id', getHolidayType);

// Admin routes
router.get('/admin/all', adminAuth, getAllHolidayTypesAdmin);

// ✅ CREATE Holiday Type - Upload to paradise-yatra/holiday-types
// Handle both JSON and FormData requests
router.post('/', adminAuth, async (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Only apply file upload middleware for multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    return uploadSingleImage(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  }
  // For JSON requests, proceed without file upload middleware
  next();
}, async (req, res) => {
  try {
    console.log('POST /holiday-types - Creating holiday type');
    console.log('Content-Type:', req.headers['content-type']);
    
    // Log request body safely
    try {
      console.log('Request body keys:', req.body ? Object.keys(req.body) : 'No body');
      console.log('Request body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');
    } catch (logError) {
      console.log('Request body: (unable to stringify)');
    }
    
    console.log('Request file:', req.file ? `File: ${req.file.originalname}, Size: ${req.file.size}` : 'No file');

    // Ensure req.body exists
    if (!req.body) {
      console.error('❌ Request body is undefined');
      return res.status(400).json({ 
        message: 'Request body is missing. Please ensure the request includes all required fields.' 
      });
    }

    const { 
      title,
      slug,
      description,
      shortDescription,
      duration,
      travelers,
      badge,
      price,
      country,
      state,
      tourType,
      category,
      order,
      isActive,
      isFeatured,
      image
    } = req.body;

    // Validate required fields
    if (!title || !description || !shortDescription) {
      return res.status(400).json({ 
        message: 'Missing required fields. Title, description, and short description are required.' 
      });
    }

    // Handle image - either upload file or use provided URL
    let imageUrl = '';
    if (req.file) {
      // Upload image to Cloudinary in holiday-types folder
      const result = await uploadToCloudinary(req.file.path, 'holiday-types');
      
      console.log('✅ Upload result:', result);
      console.log('✅ Image URL:', result.url);
      console.log('✅ Public ID:', result.public_id);

      imageUrl = result.url;

      // Verify the URL contains the correct path
      if (!imageUrl.includes('paradise-yatra/packages/holiday-types')) {
        console.error('❌ ERROR: Image uploaded to wrong folder!');
        console.error('❌ Expected: paradise-yatra/packages/holiday-types');
        console.error('❌ Got:', imageUrl);
        throw new Error('Image uploaded to incorrect Cloudinary folder');
      }
    } else if (image || req.body.image) {
      // Use provided image URL
      imageUrl = image || req.body.image;
      console.log('✅ Using provided image URL:', imageUrl);
    } else {
      return res.status(400).json({ 
        message: 'Holiday type image is required (either upload a file or provide an image URL)' 
      });
    }

    // Generate slug from title if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Ensure unique slug
    let uniqueSlug = finalSlug;
    let counter = 1;
    while (true) {
      const existing = await HolidayType.findOne({ slug: uniqueSlug });
      if (!existing) break;
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    // Prepare holiday type data
    const holidayData = {
      title,
      slug: uniqueSlug,
      description,
      shortDescription,
      image: imageUrl,
      duration: duration || '',
      travelers: travelers || '',
      badge: badge || '',
      price: price || '',
      country: country || '',
      state: state || '',
      tourType: tourType || '',
      category: category || '',
      order: order ? parseInt(order) : 0,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      isFeatured: isFeatured === 'true' || isFeatured === true || false
    };

    const holidayType = new HolidayType(holidayData);
    await holidayType.save();
    console.log('✅ Holiday type created successfully:', holidayType._id);
    console.log('✅ Image stored:', holidayType.image);

    res.status(201).json({
      message: 'Holiday type created successfully',
      holidayType: holidayType
    });
  } catch (error) {
    console.error("❌ Create holiday type error:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message).join(', ');
      return res.status(400).json({ 
        message: `Validation error: ${messages}` 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Holiday type with this slug already exists" 
      });
    }
    
    // Generic error response
    return res.status(500).json({ 
      message: error.message || 'Failed to create holiday type'
    });
  }
});

// ✅ UPDATE Holiday Type - Upload to paradise-yatra/packages/holiday-types
// Handle both JSON and FormData requests
router.put('/:id', adminAuth, (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Only apply file upload middleware for multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    return uploadSingleImage(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  }
  // For JSON requests, proceed without file upload middleware
  next();
}, async (req, res) => {
  try {
    console.log('PUT /holiday-types/:id - Updating holiday type:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }

    const { 
      title,
      slug,
      description,
      shortDescription,
      duration,
      travelers,
      badge,
      price,
      country,
      state,
      tourType,
      category,
      order,
      isActive,
      isFeatured,
      image
    } = req.body;

    // Update fields
    if (title) holidayType.title = title;
    if (description) holidayType.description = description;
    if (shortDescription) holidayType.shortDescription = shortDescription;
    if (duration !== undefined) holidayType.duration = duration;
    if (travelers !== undefined) holidayType.travelers = travelers;
    if (badge !== undefined) holidayType.badge = badge;
    if (price !== undefined) holidayType.price = price;
    if (country !== undefined) holidayType.country = country;
    if (state !== undefined) holidayType.state = state;
    if (tourType !== undefined) holidayType.tourType = tourType;
    if (category !== undefined) holidayType.category = category;
    if (order !== undefined) holidayType.order = parseInt(order);
    
    if (isActive !== undefined) {
      holidayType.isActive = isActive === 'true' || isActive === true;
    }
    if (isFeatured !== undefined) {
      holidayType.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Update slug if title changed
    if (slug || (title && title !== holidayType.title)) {
      const baseSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (true) {
        const query = { slug: uniqueSlug };
        if (req.params.id) {
          query._id = { $ne: req.params.id };
        }
        const existing = await HolidayType.findOne(query);
        if (!existing) break;
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      holidayType.slug = uniqueSlug;
    }

    // ✅ Handle image update - Upload to paradise-yatra/packages/holiday-types
    if (req.file) {
      console.log('🔥 New image file detected for update');
      console.log('🔥 Uploading to Cloudinary folder: paradise-yatra/packages/holiday-types');
      
      // Extract old image public_id for deletion
      const oldPublicId = holidayType.image ? extractPublicId(holidayType.image) : null;
      console.log('🗑️ Old image public_id for deletion:', oldPublicId);
      
      // Upload new image to paradise-yatra/packages/holiday-types and delete old one
      const result = await uploadToCloudinary(req.file.path, 'holiday-types', null, oldPublicId);
      
      console.log('✅ Upload result:', result);
      console.log('✅ New image URL:', result.url);
      console.log('✅ New public ID:', result.public_id);
      
      holidayType.image = result.url;

      // Verify the URL contains the correct path
      if (!holidayType.image.includes('paradise-yatra/packages/holiday-types')) {
        console.error('❌ ERROR: Image uploaded to wrong folder!');
        console.error('❌ Expected: paradise-yatra/packages/holiday-types');
        console.error('❌ Got:', holidayType.image);
        throw new Error('Image uploaded to incorrect Cloudinary folder');
      }
    } else if (image) {
      // Handle image URL update (when ImageUpload component already uploaded to Cloudinary)
      console.log('🔥 Image URL provided in request body');
      console.log('🔥 New image URL:', image);
      console.log('🔥 Old image URL:', holidayType.image);
      
      // Only update if the URL is different
      if (image !== holidayType.image) {
        // Extract old image public_id for deletion if it's a Cloudinary URL
        const oldPublicId = holidayType.image ? extractPublicId(holidayType.image) : null;
        
        // If new image is from Cloudinary and old one exists, delete old one
        if (oldPublicId && image.includes('cloudinary.com') && image.includes('paradise-yatra/packages/holiday-types')) {
          try {
            await deleteFromCloudinary(oldPublicId);
            console.log('✅ Deleted old image from Cloudinary:', oldPublicId);
          } catch (deleteError) {
            console.error('⚠️ Failed to delete old image:', deleteError.message);
            // Continue with update even if deletion fails
          }
        }
        
        holidayType.image = image;
        console.log('✅ Image URL updated in database');
      } else {
        console.log('ℹ️ Image URL unchanged, skipping update');
      }
    }

    await holidayType.save();
    console.log('✅ Holiday type updated successfully');
    console.log('✅ Current image:', holidayType.image);
    
    res.json({
      message: 'Holiday type updated successfully',
      holidayType: holidayType
    });
  } catch (error) {
    console.error("❌ Update holiday type error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Holiday type with this slug already exists" });
    } else {
      res.status(500).json({ message: error.message || 'Failed to update holiday type' });
    }
  }
});

// ✅ DELETE Holiday Type - Also delete image from Cloudinary
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const holidayType = await HolidayType.findById(req.params.id);
    if (!holidayType) {
      return res.status(404).json({ message: "Holiday type not found" });
    }

    // Delete image from Cloudinary if it exists
    if (holidayType.image) {
      const publicId = extractPublicId(holidayType.image);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log('✅ Deleted image from Cloudinary:', publicId);
        } catch (deleteError) {
          console.error('⚠️ Failed to delete image from Cloudinary:', deleteError.message);
          // Continue with deletion even if Cloudinary delete fails
        }
      }
    }

    await HolidayType.findByIdAndDelete(req.params.id);
    res.json({ message: "Holiday type deleted successfully" });
  } catch (error) {
    console.error("❌ Delete holiday type error:", error);
    res.status(500).json({ message: error.message || "Error deleting holiday type" });
  }
});

router.patch('/:id/toggle-status', adminAuth, toggleHolidayTypeStatus);
router.patch('/:id/toggle-featured', adminAuth, toggleHolidayTypeFeatured);
router.patch('/:id/order', adminAuth, updateHolidayTypeOrder);

module.exports = router; 