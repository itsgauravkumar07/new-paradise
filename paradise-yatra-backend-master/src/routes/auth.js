const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleLogin,
  sendOTP,
  verifyOTP,
  adminForgotPassword,
  verifyAdminResetOTP,
  resetAdminPassword,
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Admin password reset
router.post("/admin/forgot-password", adminForgotPassword);
router.post("/admin/verify-reset-otp", verifyAdminResetOTP);
router.post("/admin/reset-password", resetAdminPassword);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;
