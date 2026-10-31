const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Package = require('./models/Package');
const AllPackage = require('./models/AllPackage');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fetch all packages from the original collection
        const originalPackages = await Package.find({});
        console.log(`Found ${originalPackages.length} packages in the 'packages' collection.`);

        if (originalPackages.length === 0) {
            console.log('No packages to migrate.');
            process.exit(0);
        }

        const transformedPackages = originalPackages.map(pkg => {
            return {
                name: pkg.title,
                slug: pkg.slug,
                description: pkg.description,
                shortDescription: pkg.shortDescription,
                image: pkg.images && pkg.images.length > 0 ? pkg.images[0] : "",
                location: pkg.destination,
                holidayType: pkg.holidayType,
                country: pkg.country,
                state: pkg.state,
                tourType: pkg.tourType,
                price: pkg.price,
                originalPrice: pkg.originalPrice,
                discount: pkg.discount,
                duration: pkg.duration,
                highlights: pkg.highlights,
                inclusions: pkg.inclusions,
                exclusions: pkg.exclusions,
                isActive: pkg.isActive,
                visitCount: 0, // Default for new collection
                tags: pkg.tags,
                // Transform itinerary: remove accommodation and meals
                itinerary: pkg.itinerary.map(item => ({
                    day: item.day,
                    title: item.title,
                    activities: item.activities,
                    image: item.image
                }))
            };
        });

        // Optional: Clear 'allpackages' if you want a fresh sync
        // await AllPackage.deleteMany({});
        // console.log('Cleared existing allpackages');

        // Insert into the 'allpackages' collection
        // We use insertMany but carefully, maybe check for slug uniqueness if you run multiple times
        for (const pkg of transformedPackages) {
            try {
                await AllPackage.findOneAndUpdate(
                    { slug: pkg.slug },
                    pkg,
                    { upsert: true, new: true, runValidators: true }
                );
            } catch (err) {
                console.error(`Error migrating package with slug ${pkg.slug}:`, err.message);
            }
        }

        console.log('Successfully migrated/synced all packages to the allpackages collection!');

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrate();
