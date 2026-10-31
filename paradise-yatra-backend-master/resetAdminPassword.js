const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    let adminUser = await User.findOne({ email: 'admin@paradiseyatra.com' });
    
    if (adminUser) {
      console.log('Admin user found. Resetting password...');
      adminUser.password = '@paradiseYATRA1';
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Password reset successfully to @paradiseYATRA1');
    } else {
      console.log('Admin user not found. Creating one...');
      adminUser = new User({
        name: 'Admin',
        email: 'admin@paradiseyatra.com',
        password: '@paradiseYATRA1',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created with password @paradiseYATRA1');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();
