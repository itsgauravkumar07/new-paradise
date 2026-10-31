const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Signup = require('./models/Signup');

async function checkWishlists() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- Checking Signup collection (signup-users) ---');
        const signups = await Signup.find({ wishlist: { $exists: true, $not: { $size: 0 } } }).limit(5);
        if (signups.length === 0) {
            console.log('No signups found with non-empty wishlist.');
        } else {
            signups.forEach(u => {
                console.log(`User: ${u.email}, Wishlist Size: ${u.wishlist.length}, IDs: ${u.wishlist}`);
            });
        }

        console.log('\n--- Checking User collection (users) ---');
        const users = await User.find({ wishlist: { $exists: true, $not: { $size: 0 } } }).limit(5);
        if (users.length === 0) {
            console.log('No users found with non-empty wishlist.');
        } else {
            users.forEach(u => {
                console.log(`User: ${u.email}, Wishlist Size: ${u.wishlist.length}, IDs: ${u.wishlist}`);
            });
        }

        // Also check if any user has a wishlist field at all but it's empty
        const totalSignups = await Signup.countDocuments();
        const totalUsers = await User.countDocuments();
        console.log(`\nTotal Signups: ${totalSignups}, Total Users: ${totalUsers}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkWishlists();
