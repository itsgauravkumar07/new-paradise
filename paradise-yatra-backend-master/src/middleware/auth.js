const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Signup = require("../models/Signup");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded Token:", decoded);

    // First try finding in User collection
    let user = await User.findById(decoded.userId).select("-password");

    // If not found, try finding in Signup collection
    if (!user) {
      user = await Signup.findById(decoded.userId).select("-password");
    }

    if (!user) {
      console.log(`Auth Failed: User not found for ID ${decoded.userId}`);
      return res.status(401).json({ message: "User not found." });
    }

    if (!user.isActive) {
      console.log(`Auth Failed: User ${user.email} is inactive`);
      return res.status(401).json({ message: "User inactive." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

// const adminAuth = async (req, res, next) => {
//   try {
//     await auth(req, res, () => {
//       if (req.user.role !== "admin") {
//         return res
//           .status(403)
//           .json({ message: "Access denied. Admin role required." });
//       }
//       next();
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error." });
//   }
// };

// module.exports = { auth, adminAuth };

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin role required." });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Section-aware auth: admin always passes; any other role must be in the
// allowedRoles list for that route. Usage: requireRole(["developer", "marketer"])
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      await auth(req, res, () => {
        if (req.user.role === "admin" || allowedRoles.includes(req.user.role)) {
          return next();
        }
        return res
          .status(403)
          .json({ message: "Access denied. You don't have permission for this section." });
      });
    } catch (error) {
      res.status(500).json({ message: "Server error." });
    }
  };
};

module.exports = { auth, adminAuth, requireRole };