require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Update existing Spiritual Packages with better images
    await AllPackage.findOneAndUpdate(
        { slug: "varanasi-spiritual-tour" },
        { image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?w=800&q=80" } // Varanasi Ghats
    );

    await AllPackage.findOneAndUpdate(
        { slug: "char-dham-yatra" },
        { image: "https://images.unsplash.com/photo-1596781442111-eeb7a59a7217?w=800&q=80" } // Kedarnath Temple
    );

    await AllPackage.findOneAndUpdate(
        { slug: "tirupati-darshan" },
        { image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80" } // South Indian Temple
    );

    // 2. Add 3 more spiritual packages to fill the 6-slot masonry grid
    const amritsar = await AllPackage.findOneAndUpdate(
        { slug: "golden-temple-tour" },
        {
            name: "Golden Temple Tour",
            slug: "golden-temple-tour",
            description: "Visit the holy Golden Temple in Amritsar.",
            shortDescription: "2 Days in Amritsar",
            image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
            location: "Amritsar",
            country: "India",
            state: "Punjab",
            tourType: "india",
            price: 10000,
            duration: "2 Days",
            isActive: true
        },
        { upsert: true, new: true }
    );

    const rishikesh = await AllPackage.findOneAndUpdate(
        { slug: "rishikesh-spiritual-retreat" },
        {
            name: "Rishikesh Spiritual Retreat",
            slug: "rishikesh-spiritual-retreat",
            description: "Yoga and meditation in the yoga capital of the world.",
            shortDescription: "4 Days in Rishikesh",
            image: "https://images.unsplash.com/photo-1600007881023-e455da4b3f81?w=800&q=80",
            location: "Rishikesh",
            country: "India",
            state: "Uttarakhand",
            tourType: "india",
            price: 15000,
            duration: "4 Days",
            isActive: true
        },
        { upsert: true, new: true }
    );

    const madurai = await AllPackage.findOneAndUpdate(
        { slug: "madurai-temple-tour" },
        {
            name: "Madurai Temple Tour",
            slug: "madurai-temple-tour",
            description: "Explore the ancient Meenakshi Temple.",
            shortDescription: "3 Days in Madurai",
            image: "https://images.unsplash.com/photo-1600010996879-1c19b0221379?w=800&q=80",
            location: "Madurai",
            country: "India",
            state: "Tamil Nadu",
            tourType: "india",
            price: 12000,
            duration: "3 Days",
            isActive: true
        },
        { upsert: true, new: true }
    );

    // 3. Update the Spiritual Tag to include all 6 packages
    const spiritualTag = await Tag.findOne({ slug: "spiritual" });
    if (spiritualTag) {
        // Find existing ones
        const varanasi = await AllPackage.findOne({ slug: "varanasi-spiritual-tour" });
        const chardham = await AllPackage.findOne({ slug: "char-dham-yatra" });
        const tirupati = await AllPackage.findOne({ slug: "tirupati-darshan" });

        spiritualTag.packages = [
            varanasi._id,
            chardham._id,
            tirupati._id,
            amritsar._id,
            rishikesh._id,
            madurai._id
        ];
        await spiritualTag.save();
    }

    console.log("Updated images and added new packages for a clean UI!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to update UI packages", error);
    process.exit(1);
  }
};

runUpdate();
