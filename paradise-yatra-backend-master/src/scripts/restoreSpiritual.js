require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const restore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // We already have these packages in AllPackage, we just need to link them
    const slugs = [
        "varanasi-spiritual-tour",
        "char-dham-yatra",
        "tirupati-darshan",
        "golden-temple-tour",
        "rishikesh-spiritual-retreat",
        "madurai-temple-tour"
    ];

    const packageIds = [];
    for (const slug of slugs) {
        const pkg = await AllPackage.findOne({ slug });
        if (pkg) {
            packageIds.push(pkg._id);
        }
    }

    let spiritualTag = await Tag.findOne({ slug: "spiritual" });
    if (!spiritualTag) {
        spiritualTag = await Tag.create({
            name: "Spiritual",
            slug: "spiritual",
            description: "A Journey Through Sacred India",
            image: "https://images.unsplash.com/photo-1600080836526-cb1734bc1561?w=800&q=80",
            packages: packageIds
        });
        console.log("Created Spiritual tag and linked packages.");
    } else {
        spiritualTag.packages = packageIds;
        await spiritualTag.save();
        console.log("Updated Spiritual tag with packages.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to restore spiritual tag", error);
    process.exit(1);
  }
};

restore();
