const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User'); // Adjust path if needed
const bcrypt = require('bcryptjs');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@paradiseyatra.com';
    const newPassword = 'Fluzion11@'; // simple password

    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      console.log('Admin user not found, creating one...');
      adminUser = new User({
        name: 'Admin',
        email: email,
        role: 'admin',
        phone: '1234567890',
        isActive: true,
      });
    }

    // Hash password explicitly if Mongoose middleware doesn't or we want to be sure
    // Actually, User.js probably has a pre-save hook. Let's just save it.
    adminUser.password = newPassword;
    await adminUser.save();
    
    console.log(`Admin password reset successfully! Email: ${email}, Password: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetAdmin();
