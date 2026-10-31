require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing Tags...");
    await Tag.deleteMany({});

    // Let's create some spiritual packages in AllPackage if they don't exist
    const varanasiPackage = await AllPackage.create({
        name: "Varanasi Spiritual Tour",
        slug: "varanasi-spiritual-tour",
        description: "Experience the spiritual capital of India.",
        shortDescription: "3 Days in Varanasi",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80",
        location: "Varanasi",
        country: "India",
        state: "Uttar Pradesh",
        tourType: "india",
        price: 15000,
        duration: "3 Days",
        isActive: true
    });

    const chardhamPackage = await AllPackage.create({
        name: "Char Dham Yatra",
        slug: "char-dham-yatra",
        description: "The ultimate spiritual journey in the Himalayas.",
        shortDescription: "12 Days Char Dham",
        image: "https://images.unsplash.com/photo-1626083543160-5755106a77e5?w=800&q=80",
        location: "Uttarakhand",
        country: "India",
        state: "Uttarakhand",
        tourType: "india",
        price: 45000,
        duration: "12 Days",
        isActive: true
    });

    const tirupatiPackage = await AllPackage.create({
        name: "Tirupati Darshan",
        slug: "tirupati-darshan",
        description: "Visit the holy shrine of Lord Venkateswara.",
        shortDescription: "2 Days in Tirupati",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
        location: "Tirupati",
        country: "India",
        state: "Andhra Pradesh",
        tourType: "india",
        price: 8000,
        duration: "2 Days",
        isActive: true
    });

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

    console.log("Inserting Spiritual Tag...");
    const spiritualTag = await Tag.create({
      name: "Spiritual",
      slug: "spiritual",
      description: "A Journey Through Sacred India",
      image: "https://images.unsplash.com/photo-1600080836526-cb1734bc1561?w=800&q=80",
      packages: [varanasiPackage._id, chardhamPackage._id, tirupatiPackage._id]
    });

    console.log("Inserting Luxury Tag...");
    const luxuryTag = await Tag.create({
      name: "Luxury",
      slug: "luxury",
      description: "Luxury Tour Packages",
      image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=800&q=80",
      packages: [luxuryPackage1._id, luxuryPackage2._id]
    });

    console.log("Dummy data seeding complete for Tags!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed Tags", error);
    process.exit(1);
  }
};

runSeed();
