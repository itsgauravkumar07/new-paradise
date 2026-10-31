require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const addMoreSpiritual = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const newPackages = [
        {
            name: "Ayodhya Ram Mandir Darshan",
            slug: "ayodhya-ram-mandir",
            description: "Visit the holy birthplace of Lord Rama.",
            shortDescription: "2 Days in Ayodhya",
            image: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=800&q=80",
            location: "Ayodhya",
            country: "India",
            state: "Uttar Pradesh",
            tourType: "india",
            price: 8000,
            duration: "2 Days",
            isActive: true
        },
        {
            name: "Vaishno Devi Yatra",
            slug: "vaishno-devi-yatra",
            description: "Trek to the holy shrine of Mata Vaishno Devi.",
            shortDescription: "3 Days in Katra",
            image: "https://images.unsplash.com/photo-1626083543160-5755106a77e5?w=800&q=80",
            location: "Katra",
            country: "India",
            state: "Jammu and Kashmir",
            tourType: "india",
            price: 12000,
            duration: "3 Days",
            isActive: true
        },
        {
            name: "Somnath Temple Visit",
            slug: "somnath-temple-visit",
            description: "Seek blessings at the first Jyotirlinga.",
            shortDescription: "2 Days in Gujarat",
            image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
            location: "Somnath",
            country: "India",
            state: "Gujarat",
            tourType: "india",
            price: 9500,
            duration: "2 Days",
            isActive: true
        },
        {
            name: "Bodh Gaya Spiritual Tour",
            slug: "bodh-gaya-tour",
            description: "Experience tranquility where Buddha attained enlightenment.",
            shortDescription: "3 Days in Bihar",
            image: "https://images.unsplash.com/photo-1600010996879-1c19b0221379?w=800&q=80",
            location: "Bodh Gaya",
            country: "India",
            state: "Bihar",
            tourType: "india",
            price: 11000,
            duration: "3 Days",
            isActive: true
        }
    ];

    const spiritualTag = await Tag.findOne({ slug: "spiritual" });
    if (!spiritualTag) {
        console.error("Spiritual tag not found!");
        process.exit(1);
    }

    for (const pkgData of newPackages) {
        const pkg = await AllPackage.findOneAndUpdate(
            { slug: pkgData.slug },
            pkgData,
            { upsert: true, new: true }
        );
        
        if (!spiritualTag.packages.includes(pkg._id)) {
            spiritualTag.packages.push(pkg._id);
        }
    }

    await spiritualTag.save();

    console.log("Added 4 more spiritual packages successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed", error);
    process.exit(1);
  }
};
addMoreSpiritual();
