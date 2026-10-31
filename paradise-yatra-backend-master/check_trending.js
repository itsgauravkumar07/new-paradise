const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/tarunmeharwal/paradise-yatra-main-site/paradise-yatra-backend-master/.env' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Package = require('./models/Package');
    const Destination = require('./models/Destination');

    const packages = await Package.find({ category: 'Trending Destinations' });
    console.log(`Found ${packages.length} packages with category "Trending Destinations"`);
    packages.forEach(p => console.log(`Package: ${p.title} (${p._id})`));

    const trendingDestinations = await Destination.find({ isTrending: true });
    console.log(`Found ${trendingDestinations.length} destinations with isTrending: true`);
    trendingDestinations.forEach(d => console.log(`Destination: ${d.name} (${d._id})`));

    process.exit();
}

check();
