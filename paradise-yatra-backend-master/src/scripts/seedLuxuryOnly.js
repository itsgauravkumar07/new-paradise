require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clean up older luxury items if any
    await AllPackage.deleteMany({ slug: { $in: ["maldives-luxury-resort", "swiss-alps-premium"] } });
    await Tag.deleteMany({ slug: "luxury" });

    const luxuryPackage1 = await AllPackage.create({
        name: "Maldives Luxury Resort",
        slug: "maldives-luxury-resort",
        description: "Stay in a premium water villa.",
        shortDescription: "5 Days in Maldives",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
        location: "Maldives",
        country: "Maldives",
        tourType: "international",
        price: 250000,
        duration: "5 Days",
        isActive: true
    });

    const luxuryPackage2 = await AllPackage.create({
        name: "Swiss Alps Premium",
        slug: "swiss-alps-premium",
        description: "Luxury stay in the Swiss Alps.",
        shortDescription: "7 Days in Switzerland",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
        location: "Zurich",
        country: "Switzerland",
        tourType: "international",
        price: 350000,
        duration: "7 Days",
        isActive: true
    });

    console.log("Inserting Luxury Tag...");
    const luxuryTag = await Tag.create({
      name: "Luxury",
      slug: "luxury",
      description: "Luxury Tour Packages",
      image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=800&q=80",
      packages: [luxuryPackage1._id, luxuryPackage2._id]
    });

    console.log("Luxury data seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed luxury packages", error);
    process.exit(1);
  }
};

runSeed();
