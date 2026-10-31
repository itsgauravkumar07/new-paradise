const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Dynamic folder mapping based on content type and category
 */
const getFolderPath = (contentType, category = null) => {
  // Normalize contentType to lowercase for matching
  const normalizedContentType = contentType ? contentType.toLowerCase().trim() : null;

  // Pre-defined folder mappings
  const folderMap = {
    // Content types
    'destinations': 'paradise-yatra/destinations',
    'blogs': 'paradise-yatra/blogs',
    'testimonials': 'paradise-yatra/testimonials',
    'hero': 'paradise-yatra/hero',
    'cta': 'paradise-yatra/cta',
    'holiday-types': 'paradise-yatra/packages/holiday-types',
    'misc': 'paradise-yatra/misc',
    'default': 'paradise-yatra/misc', // Map 'default' to 'misc' folder

    // Package categories
    'packages': 'paradise-yatra/packages',
    'trending-destinations': 'paradise-yatra/packages/trending-destinations',
    'popular-packages': 'paradise-yatra/packages/popular-packages',
    'holiday-packages': 'paradise-yatra/packages/holiday-packages',
    'adventure-packages': 'paradise-yatra/packages/adventure-packages',
    'premium-packages': 'paradise-yatra/packages/premium-packages',
    'fixed-departure': 'paradise-yatra/packages/fixed-departure',
    'all-packages': 'paradise-yatra/packages',
  };

  console.log(`📁 getFolderPath called with contentType: "${contentType}", normalized: "${normalizedContentType}", category: "${category}"`);

  // If direct match found in folderMap (case-insensitive)
  if (normalizedContentType && folderMap[normalizedContentType]) {
    const folder = folderMap[normalizedContentType];
    console.log(`✅ Matched folderMap: ${folder}`);
    return folder;
  }

  // For packages with category
  if (normalizedContentType === 'packages' && category) {
    const safeCategoryName = category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const folder = `paradise-yatra/packages/${safeCategoryName}`;
    console.log(`✅ Packages with category: ${folder}`);
    return folder;
  }

  // For dynamic categories (backward compatibility with old code)
  if (normalizedContentType && normalizedContentType.includes('-')) {
    const safeCategoryName = normalizedContentType
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const folder = `paradise-yatra/packages/${safeCategoryName}`;
    console.log(`✅ Dynamic category: ${folder}`);
    return folder;
  }

  // Default fallback
  const defaultFolder = `paradise-yatra/${normalizedContentType || 'default'}`;
  console.log(`⚠️ Using default fallback: ${defaultFolder}`);
  return defaultFolder;
};

/**
 * Upload image to Cloudinary with dynamic folder
 * @param {String} filePath - Local file path from multer
 * @param {String} contentTypeOrCategory - Content type (destinations, packages, blogs) OR legacy category string
 * @param {String} category - Optional: Category for packages (used when first param is 'packages')
 * @param {String} oldPublicId - Optional: public_id of old image to delete
 */
const uploadToCloudinary = async (filePath, contentTypeOrCategory = "misc", category = null, oldPublicId = null) => {
  // Support legacy single-parameter usage: uploadToCloudinary(path, 'trending-destinations')
  const contentType = contentTypeOrCategory;

  // Normalize category: handle string "null" or "undefined" as actual null
  let normalizedCategory = category;
  if (category === "null" || category === "undefined" || category === null || category === undefined) {
    normalizedCategory = null;
  }

  console.log(`🚀 uploadToCloudinary called with:`);
  console.log(`   - filePath: ${filePath}`);
  console.log(`   - contentTypeOrCategory: "${contentTypeOrCategory}"`);
  console.log(`   - category: "${category}" (normalized: ${normalizedCategory === null ? 'null' : `"${normalizedCategory}"`})`);
  console.log(`   - oldPublicId: "${oldPublicId}"`);

  // If no category provided and contentType looks like a category, extract it
  if (!normalizedCategory && contentType && contentType.includes('-')) {
    // This is likely a legacy category parameter
    normalizedCategory = contentType;
    console.log(`   - Extracted category from contentType: "${normalizedCategory}"`);
  }

  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const folder = getFolderPath(contentType, normalizedCategory);

    // Ensure blogs and packages are always stored in their required top-level folders.
    let finalFolder = folder;
    if (contentType && contentType.toLowerCase().trim() === 'blogs') {
      finalFolder = 'paradise-yatra/blogs';
      console.log(`🔧 FORCED folder to: "${finalFolder}" for blogs content type`);
    } else if (
      contentType &&
      [
        'packages',
        'all-packages',
      ].includes(contentType.toLowerCase().trim())
    ) {
      finalFolder = 'paradise-yatra/packages';
      console.log(`🔧 FORCED folder to: "${finalFolder}" for package content type`);
    }

    console.log(`📤 Uploading to Cloudinary folder: "${finalFolder}"`);
    console.log(`📤 Full upload options: folder="${finalFolder}"`);

    // Upload new image with explicit folder setting
    const uploadOptions = {
      folder: finalFolder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      transformation: [
        { quality: "auto", fetch_format: "auto" }
      ],
    };

    console.log(`📤 Upload options:`, JSON.stringify(uploadOptions, null, 2));

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`✅ Upload successful: ${result.secure_url}`);
    console.log(`✅ Public ID: ${result.public_id}`);
    console.log(`✅ Folder in public_id: ${result.public_id.split('/').slice(0, -1).join('/')}`);

    // Verify folder is correct
    const expectedFolderParts = folder.split('/');
    const actualFolderParts = result.public_id.split('/').slice(0, -1);
    const folderMatches = JSON.stringify(expectedFolderParts) === JSON.stringify(actualFolderParts);

    if (!folderMatches) {
      console.error(`❌ FOLDER MISMATCH!`);
      console.error(`   Expected: ${folder}`);
      console.error(`   Got: ${actualFolderParts.join('/')}`);
      console.error(`   Full public_id: ${result.public_id}`);
    } else {
      console.log(`✅ Folder verification: CORRECT`);
    }

    // Delete local temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete old Cloudinary image if provided
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`Deleted old image: ${oldPublicId}`);
      } catch (deleteError) {
        console.error(`Failed to delete old image ${oldPublicId}:`, deleteError.message);
        // Don't throw - new image uploaded successfully
      }
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      asset_id: result.asset_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Clean up local file on error
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple images
 */
const uploadMultipleToCloudinary = async (files, contentType = "misc", category = null) => {
  try {
    const fileArray = Array.isArray(files) ? files : [files];
    const folder = getFolderPath(contentType, category);

    const uploadPromises = fileArray.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: folder,
        use_filename: true,
        unique_filename: true,
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ],
      })
    );

    const results = await Promise.all(uploadPromises);

    // Cleanup local files
    fileArray.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));
  } catch (error) {
    // Cleanup on error
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.warn("No public_id provided for deletion");
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`, result);
    return result;
  } catch (error) {
    console.error(`Cloudinary delete error for ${publicId}:`, error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Extract public_id from Cloudinary URL
 */
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') return null;

  // Check if it's a Cloudinary URL
  if (!cloudinaryUrl.includes('cloudinary.com')) return null;

  // Extract public_id from URL
  // Example: https://res.cloudinary.com/xxx/image/upload/v123/paradise-yatra/packages/popular-packages/image.jpg
  const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return matches ? matches[1] : null;
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  getFolderPath,
};
