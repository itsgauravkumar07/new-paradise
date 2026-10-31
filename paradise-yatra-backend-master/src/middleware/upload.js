// const multer = require("multer");
// const path = require("path");
// const cloudinary = require("../config/cloudinary");
// const CloudinaryStorage = require("multer-storage-cloudinary").CloudinaryStorage;

// // Configure Cloudinary storage for multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "paradise-yatra", // Folder name in Cloudinary
//     allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
//     transformation: [{ quality: "auto", fetch_format: "auto" }],
//   },
// });

// // File filter for images
// const fileFilter = (req, file, cb) => {
//   // Accept only image files
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// // Configure multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//     files: 10, // Maximum 10 files
//   },
// });

// // Middleware for package image uploads
// const uploadPackageImages = upload.array("images", 10);

// // Middleware for single image upload (for destinations, packages, etc.)
// const uploadSingleImage = upload.single("image");

// // Error handling middleware for multer
// const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       return res
//         .status(400)
//         .json({ message: "File too large. Maximum size is 5MB." });
//     }
//     if (err.code === "LIMIT_FILE_COUNT") {
//       return res
//         .status(400)
//         .json({ message: "Too many files. Maximum 10 files allowed." });
//     }
//   }
//   if (err.message === "Only image files are allowed!") {
//     return res.status(400).json({ message: err.message });
//   }
//   next(err);
// };

// module.exports = {
//   uploadPackageImages,
//   uploadSingleImage,
//   handleUploadError,
// };






const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use disk storage (temp files before Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 220 * 1024, // 220KB
  },
});

const uploadSingleImage = upload.single("image");
const uploadMultipleImages = upload.array("images", 10);

// Error handler
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max 220KB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Max 10 allowed." });
    }
  }
  if (err.message === "Only image files are allowed!") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

// ✅ ONLY EXPORT THESE - NO ROUTES HERE
module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  handleUploadError,
};

// ❌ DO NOT ADD ANY ROUTES BELOW THIS LINE
// ❌ NO router.post(), router.get(), etc.
