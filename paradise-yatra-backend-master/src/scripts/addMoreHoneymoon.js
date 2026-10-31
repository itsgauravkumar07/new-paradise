require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const newHoneymoonPackages = [
        {
            name: "Swiss Romance",
            slug: "swiss-romance",
            description: "A romantic journey through the Swiss Alps.",
            shortDescription: "6 Days in Switzerland",
            image: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800&q=80",
            location: "Zurich",
            country: "Switzerland",
            tourType: "international",
            price: 150000,
            duration: "6 Days",
            isActive: true
        },
        {
            name: "Bali Bliss Honeymoon",
            slug: "bali-bliss-honeymoon",
            description: "Experience the ultimate romantic getaway in Bali.",
            shortDescription: "7 Days in Bali",
            image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
            location: "Bali",
            country: "Indonesia",
            tourType: "international",
            price: 80000,
            duration: "7 Days",
            isActive: true
        },
        {
            name: "Mauritius Romantic Escape",
            slug: "mauritius-romantic-escape",
            description: "Pristine beaches and luxury resorts in Mauritius.",
            shortDescription: "5 Days in Mauritius",
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=80",
            location: "Mauritius",
            country: "Mauritius",
            tourType: "international",
            price: 120000,
            duration: "5 Days",
            isActive: true
        },
        {
            name: "Andaman Couple Special",
            slug: "andaman-couple-special",
            description: "Crystal clear waters and white sandy beaches.",
            shortDescription: "6 Days in Andaman",
            image: "https://images.unsplash.com/photo-1590559899731-a382839cecd5?w=800&q=80",
            location: "Andaman",
            country: "India",
            tourType: "india",
            price: 60000,
            duration: "6 Days",
            isActive: true
        },
        {
            name: "Seychelles Dream Vacation",
            slug: "seychelles-dream",
            description: "The perfect romantic hideaway in Seychelles.",
            shortDescription: "7 Days in Seychelles",
            image: "https://images.unsplash.com/photo-1582201943021-e8e5b614afde?w=800&q=80",
            location: "Seychelles",
            country: "Seychelles",
            tourType: "international",
            price: 200000,
            duration: "7 Days",
            isActive: true
        }
    ];

    const honeymoonTag = await Tag.findOne({ slug: "honeymoon" });
    if (!honeymoonTag) {
        console.error("Honeymoon tag not found!");
        process.exit(1);
    }

    const packageIds = [];
    for (const pkg of newHoneymoonPackages) {
        const newPkg = await AllPackage.findOneAndUpdate(
            { slug: pkg.slug },
            pkg,
            { upsert: true, new: true }
        );
        packageIds.push(newPkg._id);
    }

    // Add new package IDs to the honeymoon tag avoiding duplicates
    honeymoonTag.packages = [...new Set([...honeymoonTag.packages.map(p => p.toString()), ...packageIds.map(p => p.toString())])];
    await honeymoonTag.save();

    console.log("Added more honeymoon packages successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add more honeymoon packages", error);
    process.exit(1);
  }
};

runSeed();
