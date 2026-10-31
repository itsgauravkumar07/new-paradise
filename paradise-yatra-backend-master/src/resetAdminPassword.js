const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const Signup = require("./models/Signup");

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@paradiseyatra.com";
    const newPassword = "Admin.paradiseyatra";

    // First check User collection
    let user = await User.findOne({ email });

    if (user) {
      user.password = newPassword;
      user.role = "admin";
      user.isActive = true;

      await user.save();

      console.log("Admin password reset successfully in User collection.");
      console.log("Email:", email);
      process.exit(0);
    }

    // If not found, check Signup collection
    user = await Signup.findOne({ email });

    if (user) {
      user.password = newPassword;
      user.role = "admin";
      user.isActive = true;

      await user.save();

      console.log("Admin password reset successfully in Signup collection.");
      console.log("Email:", email);
      process.exit(0);
    }

    console.log("Admin user was not found.");
    process.exit(1);

  } catch (error) {
    console.error("Password reset error:", error);
    process.exit(1);
  }
};

resetAdminPassword();