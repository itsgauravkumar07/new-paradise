const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const {
  getCTAContent,
  createCTAContent,
  updateCTAContent,
  deleteCTAContent,
} = require("../controllers/ctaController");

// Public routes
router.get("/", getCTAContent);

// Admin routes
router.post("/", adminAuth, createCTAContent);
router.put("/:id", adminAuth, updateCTAContent);
router.delete("/:id", adminAuth, deleteCTAContent);

module.exports = router;
