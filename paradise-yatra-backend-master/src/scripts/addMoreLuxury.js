require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const newLuxuryPackages = [
        {
            name: "Dubai Royal Experience",
            slug: "dubai-royal-experience",
            description: "Experience absolute luxury in Dubai.",
            shortDescription: "4 Days in Dubai",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
            location: "Dubai",
            country: "UAE",
            tourType: "international",
            price: 180000,
            duration: "4 Days",
            isActive: true
        },
        {
            name: "Santorini Exclusive Villa",
            slug: "santorini-exclusive",
            description: "Private luxury villa in Santorini.",
            shortDescription: "6 Days in Greece",
            image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
            location: "Santorini",
            country: "Greece",
            tourType: "international",
            price: 280000,
            duration: "6 Days",
            isActive: true
        },
        {
            name: "Bora Bora Overwater Retreat",
            slug: "bora-bora-retreat",
            description: "Ultimate seclusion in an overwater bungalow.",
            shortDescription: "7 Days in French Polynesia",
            image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
            location: "Bora Bora",
            country: "French Polynesia",
            tourType: "international",
            price: 450000,
            duration: "7 Days",
            isActive: true
        },
        {
            name: "Amalfi Coast Premium",
            slug: "amalfi-coast-premium",
            description: "Luxurious escape along the Amalfi Coast.",
            shortDescription: "5 Days in Italy",
            image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80",
            location: "Amalfi Coast",
            country: "Italy",
            tourType: "international",
            price: 320000,
            duration: "5 Days",
            isActive: true
        }
    ];

    const luxuryTag = await Tag.findOne({ slug: "luxury" });
    if (!luxuryTag) {
        console.error("Luxury tag not found!");
        process.exit(1);
    }

    const packageIds = [];
    for (const pkg of newLuxuryPackages) {
        const newPkg = await AllPackage.findOneAndUpdate(
            { slug: pkg.slug },
            pkg,
            { upsert: true, new: true }
        );
        packageIds.push(newPkg._id);
    }

    // Add new package IDs to the luxury tag avoiding duplicates
    luxuryTag.packages = [...new Set([...luxuryTag.packages.map(p => p.toString()), ...packageIds.map(p => p.toString())])];
    await luxuryTag.save();

    console.log("Added more luxury packages successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add more luxury packages", error);
    process.exit(1);
  }
};

runSeed();
