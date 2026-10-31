const express = require("express");
const router = express.Router();
const { auth, adminAuth, requireRole } = require("../middleware/auth");
const auditLogger = require("../middleware/auditLogger");
const {
  uploadSingleImage,
  handleUploadError,
} = require("../middleware/upload");
const {
  getAllFixedDepartures,
  getFixedDeparture,
  getFixedDepartureBySlug,
  createFixedDeparture,
  updateFixedDeparture,
  deleteFixedDeparture,
  toggleFeatured,
  toggleStatus,
  getFeaturedFixedDepartures,
  searchFixedDepartures,
  getFixedDeparturesByTourType,
  getFixedDeparturesByCountry,
  getFixedDeparturesByState,
  getAvailableCountries,
  getAvailableTourTypes,
  getAvailableStates,
} = require("../controllers/fixedDepartureController");

// Public routes
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Fixed Departures API is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/", getAllFixedDepartures);
router.get("/featured", getFeaturedFixedDepartures);
router.get("/search", searchFixedDepartures);

// New filtering routes
router.get("/tour-type/:tourType", getFixedDeparturesByTourType);
router.get("/country/:country", getFixedDeparturesByCountry);
router.get("/state/:state", getFixedDeparturesByState);

// Utility routes for available options
router.get("/countries", getAvailableCountries);
router.get("/tour-types", getAvailableTourTypes);
router.get("/states", getAvailableStates);

router.get("/slug/:slug", getFixedDepartureBySlug);
router.get("/:id", getFixedDeparture);

// Admin routes
router.post(
  "/",
  requireRole(['developer', 'packageManager']),
  auditLogger('fixedDepartures'),
  createFixedDeparture
);
router.put(
  "/:id",
  requireRole(['developer', 'packageManager']),
  auditLogger('fixedDepartures'),
  updateFixedDeparture
);
router.delete("/:id", adminAuth, deleteFixedDeparture);
router.patch("/:id/toggle-featured", adminAuth, toggleFeatured);
router.patch("/:id/toggle-status", adminAuth, toggleStatus);

module.exports = router;
