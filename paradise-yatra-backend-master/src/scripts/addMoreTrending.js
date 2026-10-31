require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const addMoreTrending = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const newPackages = [
        {
            name: "Dubai Luxury Getaway",
            slug: "dubai-luxury",
            description: "Experience the ultimate luxury in Dubai.",
            shortDescription: "5 Days in Dubai",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
            location: "Dubai",
            country: "UAE",
            state: "Dubai",
            tourType: "international",
            price: 65000,
            duration: "5 Days",
            isActive: true
        },
        {
            name: "Swiss Alps Adventure",
            slug: "swiss-alps",
            description: "Discover the breathtaking beauty of the Swiss Alps.",
            shortDescription: "7 Days in Switzerland",
            image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
            location: "Zurich",
            country: "Switzerland",
            state: "Zurich",
            tourType: "international",
            price: 125000,
            duration: "7 Days",
            isActive: true
        },
        {
            name: "Maldives Paradise Escape",
            slug: "maldives-paradise",
            description: "Relax in the crystal clear waters of Maldives.",
            shortDescription: "4 Days in Maldives",
            image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
            location: "Malé",
            country: "Maldives",
            state: "Maldives",
            tourType: "international",
            price: 85000,
            duration: "4 Days",
            isActive: true
        }
    ];

    const trendingTag = await Tag.findOne({ slug: "trending" });
    if (!trendingTag) {
        console.error("Trending tag not found!");
        process.exit(1);
    }

    for (const pkgData of newPackages) {
        const pkg = await AllPackage.findOneAndUpdate(
            { slug: pkgData.slug },
            pkgData,
            { upsert: true, new: true }
        );
        
        if (!trendingTag.packages.includes(pkg._id)) {
            trendingTag.packages.push(pkg._id);
        }
    }

    await trendingTag.save();

    console.log("Added 3 more trending packages successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed", error);
    process.exit(1);
  }
};
addMoreTrending();
