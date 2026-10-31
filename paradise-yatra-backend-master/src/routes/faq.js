const express = require("express");
const router = express.Router();
const { adminAuth, requireRole } = require("../middleware/auth");
const auditLogger = require("../middleware/auditLogger");
const {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQ,
  getLocations,
  getFAQStats,
} = require("../controllers/faqController");


// Public route - anyone can view FAQs, no auth required
router.get("/", getAllFAQs);

router.get("/admin/locations", requireRole(['developer']), getLocations);
router.get("/admin/stats", requireRole(['developer']), getFAQStats);

router.post("/", requireRole(['developer']), auditLogger('faq'), createFAQ);
router.put("/reorder", requireRole(['developer']), auditLogger('faq'), reorderFAQ); // Must come before /:id route
router.get("/:id", getFAQById);
router.put("/:id", requireRole(['developer']), auditLogger('faq'), updateFAQ);
router.delete("/:id", adminAuth, deleteFAQ);

module.exports = router;
