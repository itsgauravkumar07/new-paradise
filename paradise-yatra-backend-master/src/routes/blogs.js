const express = require("express");
const router = express.Router();
const { auth, adminAuth, requireRole } = require("../middleware/auth");
const auditLogger = require("../middleware/auditLogger");
const fileParser = require("../middleware/fileParser");
const {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  searchBlogs,
  likeBlog,
} = require("../controllers/blogController");

// Public routes
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/search", searchBlogs);
router.get("/:id", getBlog);

// Protected routes
router.post("/:id/like", auth, likeBlog);

// Developer and Marketer routes
router.post("/", requireRole(['developer', 'marketer']), fileParser, auditLogger('blogs'), createBlog);
router.put("/:id", requireRole(['developer', 'marketer']), fileParser, auditLogger('blogs'), updateBlog);

// Admin routes
router.delete("/:id", adminAuth, deleteBlog);

module.exports = router;
