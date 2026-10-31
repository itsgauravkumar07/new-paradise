const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const {
  uploadSingleImage,
  handleUploadError,
} = require("../middleware/upload");
const {
  uploadImage,
  deleteImage,
  getAllImages,
} = require("../controllers/uploadController");

// Upload single image (Admin only)
router.post(
  "/image",
  adminAuth,
  uploadSingleImage,
  handleUploadError,
  uploadImage
);

// Get all images (Admin only)
router.get("/images", adminAuth, getAllImages);

// Delete image (Admin only)
router.delete("/image/:filename", adminAuth, deleteImage);

module.exports = router;
