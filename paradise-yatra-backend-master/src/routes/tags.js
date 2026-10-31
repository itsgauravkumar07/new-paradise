const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const {
    getAllTags,
    getTag,
    getTagBySlug,
    createTag,
    updateTag,
    deleteTag,
    addPackagesToTag,
    removePackagesFromTag,
} = require("../controllers/TagController");

// Public routes
router.get("/", getAllTags);
router.get("/:id", getTag);
router.get("/slug/:slug", getTagBySlug);

// Admin routes
router.post("/", adminAuth, createTag);
router.put("/:id", adminAuth, updateTag);
router.delete("/:id", adminAuth, deleteTag);

// Association routes
router.post("/:id/packages", adminAuth, addPackagesToTag);
router.delete("/:id/packages", adminAuth, removePackagesFromTag);

module.exports = router;
