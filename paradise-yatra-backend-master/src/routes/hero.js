const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const {
  getHeroContent,
  createHeroContent,
  updateHeroContent,
  deleteHeroContent,
} = require("../controllers/heroController");
const fileParser = require("../middleware/fileParser");

// Public routes
router.get("/", getHeroContent);

// Admin routes
router.post("/", adminAuth, fileParser, createHeroContent);
router.put("/:id", adminAuth, fileParser, updateHeroContent);
router.delete("/:id", adminAuth, deleteHeroContent);

module.exports = router;
