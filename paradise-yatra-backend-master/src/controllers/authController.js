const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Signup = require("../models/Signup");
const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../utils/emailService");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Check if user already exists in either collection
    const existingSignup = await Signup.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingSignup || existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp: otp.toString() });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Create new user
    const user = new Signup({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    // Delete OTP record after successful registration
    await OTP.deleteMany({ email });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user - Try both collections
    let user = await Signup.findOne({ email });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check if user has a password set (might be a Google-only account)
    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials. Please login with Google." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: "Account is deactivated." });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error during profile update." });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // The user object from req.user might not have the password field if it was deselected
    // Let's re-fetch the user with password from the correct collection
    let userWithPassword;
    if (user.constructor.modelName === 'Signup') {
      userWithPassword = await Signup.findById(user._id);
    } else {
      userWithPassword = await User.findById(user._id);
    }

    if (!userWithPassword) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await userWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error during password change." });
  }
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { idToken, phone } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId, picture } = ticket.getPayload();

    let user = await Signup.findOne({ email });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      // Create new user if not exists
      user = new Signup({
        name,
        email,
        phone,
        googleId,
        picture,
        isActive: true,
      });
      await user.save();
    } else {
      // Update existing user's Google info and phone if provided
      user.googleId = googleId;
      if (picture) user.picture = picture;
      if (phone && !user.phone) user.phone = phone;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: "Google Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        picture: user.picture || picture,
      },
    });
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({ message: "Google Login failed." });
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`);

    // Save/Update OTP in DB
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Email
    const emailResult = await sendOTPEmail(email, otp);

    if (emailResult.success) {
      res.json({ message: "OTP sent successfully to your email." });
    } else {
      res.status(500).json({ message: "Failed to send OTP email." });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

// Verify OTP (Standalone if needed)
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const otpRecord = await OTP.findOne({ email, otp: otp.toString() });

    if (otpRecord) {
      res.json({ success: true, message: "OTP verified successfully." });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error while verifying OTP." });
  }
};

//Update by new dev

// Find admin in either User or Signup collection
const findAdminByEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  let admin = await User.findOne({
    email: normalizedEmail,
    role: "admin",
  });

  let collection = "User";

  if (!admin) {
    admin = await Signup.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    collection = "Signup";
  }

  return { admin, collection };
};


// Admin Forgot Password - Send OTP
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { admin } = await findAdminByEmail(normalizedEmail);

    if (!admin) {
      return res.status(404).json({
        message: "No admin account found with this email.",
      });
    }

    if (!admin.isActive) {
      return res.status(400).json({
        message: "This admin account is inactive.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Remove previous OTPs for this email
    await OTP.deleteMany({
      email: normalizedEmail,
    });

    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(
      normalizedEmail,
      otp
    );

    if (!emailResult.success) {
      // Remove OTP if email wasn't sent
      await OTP.deleteMany({
        email: normalizedEmail,
      });

      return res.status(500).json({
        message: "Failed to send OTP email.",
      });
    }

    console.log(
      `Admin password reset OTP sent to ${normalizedEmail}`
    );

    return res.json({
      message: "OTP sent successfully to your email.",
    });

  } catch (error) {
    console.error("Admin forgot password error:", error);

    return res.status(500).json({
      message: "Server error while sending OTP.",
    });
  }
};


// Verify Admin Reset OTP
const verifyAdminResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Make sure this is actually an admin account
    const { admin } = await findAdminByEmail(normalizedEmail);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.toString(),
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully.",
    });

  } catch (error) {
    console.error("Verify admin reset OTP error:", error);

    return res.status(500).json({
      message: "Server error while verifying OTP.",
    });
  }
};


// Reset Admin Password
const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find admin
    const { admin } = await findAdminByEmail(normalizedEmail);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    // Verify OTP again
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.toString(),
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    // Set new password
    // Mongoose pre-save hook will bcrypt-hash it
    admin.password = newPassword;

    await admin.save();

    // Delete OTP so it cannot be reused
    await OTP.deleteMany({
      email: normalizedEmail,
    });

    return res.json({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {
    console.error("Reset admin password error:", error);

    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
  sendOTP,
  verifyOTP,

  adminForgotPassword,
  verifyAdminResetOTP,
  resetAdminPassword,
};
