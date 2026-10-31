/**
 * Utility functions for handling image URLs consistently across the backend
 */

/**
 * Get the full image URL for a given filename
 * @param {string} filename - The image filename
 * @returns {string} - The full image URL
 */
const getImageUrl = (filename) => {
  if (!filename) return "";

  // Remove leading slash if present
  const cleanFilename = filename.startsWith("/") ? filename.slice(1) : filename;

  // Use BACKEND_URL for image URLs since images are stored on the backend server
  const baseUrl = process.env.BACKEND_URL || process.env.CLIENT_ORIGIN || "";

  if (baseUrl) {
    // Ensure baseUrl doesn't end with slash
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/uploads/${cleanFilename}`;
  }

  // Fallback to relative path
  return `/uploads/${cleanFilename}`;
};

/**
 * Process an array of image filenames to get their full URLs
 * @param {string[]} filenames - Array of image filenames
 * @returns {string[]} - Array of full image URLs
 */
const processImageUrls = (filenames) => {
  if (!Array.isArray(filenames)) return [];
  return filenames.map((filename) => processSingleImage(filename));
};

/**
 * Process a single image filename or URL to get the full URL
 * @param {string} image - Single image filename or URL
 * @returns {string} - Full image URL
 */
const processSingleImage = (image) => {
  if (!image) return "";

  // If it's already a full URL, return as is
  if (image.startsWith("http://") || image.startsWith("https://")) {
    // Check if it's a malformed URL with double uploads path
    if (
      image.includes("/uploads/https://") ||
      image.includes("/uploads/http://")
    ) {
      // Extract the actual backend URL part
      const match = image.match(/\/uploads\/(https?:\/\/[^\/]+\/uploads\/.+)/);
      if (match) {
        return match[1];
      }
    }
    return image;
  }

  return getImageUrl(image);
};

module.exports = {
  getImageUrl,
  processImageUrls,
  processSingleImage,
};
