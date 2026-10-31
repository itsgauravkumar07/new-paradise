const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const User = require("../models/User");
const Signup = require("../models/Signup");
const Package = require("../models/Package");
const Destination = require("../models/Destination");
const Blog = require("../models/Blog");
const { ASSIGNABLE_STAFF_ROLES, STAFF_ROLES } = require("../config/roles");
const AuditLog = require("../models/AuditLog");

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = (await User.countDocuments()) + (await Signup.countDocuments());
    const totalPackages = await Package.countDocuments();
    const totalDestinations = await Destination.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const packageStats = await Package.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalPackages,
      totalDestinations,
      totalBlogs,
      packageStats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const usersFromUser = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    const usersFromSignup = await Signup.find()
      .select("-password")
      .sort({ createdAt: -1 });

    // Combine and paginate manually or just return both (for simplicity here combining)
    let allUsers = [...usersFromUser, ...usersFromSignup];

    // Sort combined users by createdAt
    allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allUsers.length;

    // Simple pagination for combined array
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = allUsers.slice(start, start + parseInt(limit));

    res.json({
      users: paginatedUsers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update user status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    let user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      user = await Signup.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true, runValidators: true }
      ).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res
      .status(500)
      .json({ message: "Server error during user status update." });
  }
};

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Popular packages
    const popularPackages = await Package.aggregate([
      { $sort: { rating: -1 } },
      { $limit: 5 },
      { $project: { title: 1, rating: 1, category: 1 } },
    ]);

    // Package category distribution
    const packageCategoryStats = await Package.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      popularPackages,
      packageCategoryStats,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all packages for admin (with inactive packages)
const getAllPackagesForAdmin = async (req, res) => {
  try {
    const { category, status, limit = 20, page = 1 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Package.countDocuments(query);

    res.json({
      packages,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get all packages for admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Bulk update package status
const bulkUpdatePackageStatus = async (req, res) => {
  try {
    const { packageIds, isActive } = req.body;

    if (!packageIds || !Array.isArray(packageIds)) {
      return res.status(400).json({ message: "Package IDs array is required" });
    }

    const result = await Package.updateMany(
      { _id: { $in: packageIds } },
      { isActive }
    );

    res.json({
      message: `${result.modifiedCount} packages updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk update package status error:", error);
    res.status(500).json({ message: "Server error during bulk update." });
  }
};

// Get package statistics
const getPackageStats = async (req, res) => {
  try {
    const totalPackages = await Package.countDocuments();
    const activePackages = await Package.countDocuments({ isActive: true });
    const featuredPackages = await Package.countDocuments({ isFeatured: true });

    const categoryStats = await Package.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const priceStats = await Package.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.json({
      totalPackages,
      activePackages,
      featuredPackages,
      categoryStats,
      priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
    });
  } catch (error) {
    console.error("Get package stats error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//New code ------

// Get all staff accounts (Admin only) - separate from the customer list in getAllUsers
const getStaffAccounts = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ staff });
  } catch (error) {
    console.error("Get staff accounts error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Create a staff account (Admin only)
const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required.",
      });
    }

    if (!ASSIGNABLE_STAFF_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Role must be one of: ${ASSIGNABLE_STAFF_ROLES.join(", ")}.`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    // Password hashing happens automatically via the User model's
    // pre('save') hook - no need to hash it here.
    const staffUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
    });

    const { password: _omit, ...safeUser } = staffUser.toObject();
    res.status(201).json({
      message: "Staff account created successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.error("Create staff account error:", error);
    res.status(500).json({ message: "Server error while creating account." });
  }
};

// Get recent audit log entries (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ logs });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//End New code ------

// Admin routes
router.get("/dashboard", adminAuth, getDashboardStats);
router.get("/users", adminAuth, getAllUsers);
router.put("/users/:id/status", adminAuth, updateUserStatus);
router.get("/analytics", adminAuth, getAnalytics);
router.get("/packages", adminAuth, getAllPackagesForAdmin);
router.put("/packages/bulk-status", adminAuth, bulkUpdatePackageStatus);
router.get("/packages/stats", adminAuth, getPackageStats);

// Staff account management (Admin only)
router.get("/staff", adminAuth, getStaffAccounts);
router.post("/staff", adminAuth, createStaffAccount);
router.get("/audit-logs", adminAuth, getAuditLogs);

module.exports = router;
