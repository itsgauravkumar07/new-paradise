const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Destination = require('./models/Destination');
const AllPackage = require('./models/AllPackage');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

const migrateDestinations = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fetch all destinations from the original collection
        const originalDestinations = await Destination.find({});
        console.log(`Found ${originalDestinations.length} destinations in the 'destinations' collection.`);

        if (originalDestinations.length === 0) {
            console.log('No destinations to migrate.');
            process.exit(0);
        }

        const transformedPackages = originalDestinations.map(dest => {
            return {
                name: dest.name,
                slug: dest.slug,
                description: dest.description,
                shortDescription: dest.shortDescription,
                image: dest.image,
                location: dest.location,
                holidayType: dest.holidayType,
                country: dest.country,
                state: dest.state,
                tourType: dest.tourType,
                price: dest.price,
                duration: dest.duration,
                highlights: dest.highlights,
                inclusions: dest.inclusions,
                exclusions: dest.exclusions,
                isActive: dest.isActive,
                isTrending: dest.isTrending,
                visitCount: dest.visitCount || 0,
                tags: [], // Tags might be empty or need different mapping
                // Transform itinerary: remove accommodation and meals
                itinerary: dest.itinerary ? dest.itinerary.map(item => ({
                    day: item.day,
                    title: item.title,
                    activities: item.activities,
                    image: item.image
                })) : []
            };
        });

        // Sync into 'allpackages'
        for (const pkg of transformedPackages) {
            try {
                await AllPackage.findOneAndUpdate(
                    { slug: pkg.slug },
                    pkg,
                    { upsert: true, new: true, runValidators: true }
                );
            } catch (err) {
                console.error(`Error migrating destination with slug ${pkg.slug}:`, err.message);
            }
        }

        console.log('Successfully migrated/synced all destinations to the allpackages collection!');

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateDestinations();
