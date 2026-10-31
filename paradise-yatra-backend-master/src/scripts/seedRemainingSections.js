require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Tag = require("../models/Tag");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const sections = [
        {
            tagSlug: "honeymoon",
            tagName: "Honeymoon",
            tagImage: "https://images.unsplash.com/photo-1549416878-b9ca95e1bb3b?w=800&q=80",
            packages: [
                { name: "Maldives Honeymoon Special", slug: "maldives-honeymoon", location: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80" },
                { name: "Romantic Paris Getaway", slug: "paris-honeymoon", location: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
                { name: "Kerala Backwaters Romance", slug: "kerala-honeymoon", location: "Kerala", country: "India", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80" }
            ]
        },
        {
            tagSlug: "trending",
            tagName: "Trending",
            tagImage: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
            packages: [
                { name: "Vietnam Adventure", slug: "vietnam-adventure", location: "Hanoi", country: "Vietnam", image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80" },
                { name: "Bali Highlights", slug: "bali-highlights", location: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" }
            ]
        },
        {
            tagSlug: "seasonal",
            tagName: "Seasonal",
            tagImage: "https://images.unsplash.com/photo-1444491741275-3747c53d99b4?w=800&q=80",
            packages: [
                { name: "Kashmir Winter Fest", slug: "kashmir-winter", location: "Gulmarg", country: "India", image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80" },
                { name: "Goa Summer Splash", slug: "goa-summer", location: "Goa", country: "India", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?w=800&q=80" }
            ]
        },
        {
            tagSlug: "festival",
            tagName: "Festival",
            tagImage: "https://images.unsplash.com/photo-1533227260871-c7c49f49372e?w=800&q=80",
            packages: [
                { name: "Pushkar Camel Fair", slug: "pushkar-fair", location: "Pushkar", country: "India", image: "https://images.unsplash.com/photo-1588636186088-25f0bd2da8ff?w=800&q=80" },
                { name: "Diwali in Jaipur", slug: "diwali-jaipur", location: "Jaipur", country: "India", image: "https://images.unsplash.com/photo-1542458428-144f80c2f82c?w=800&q=80" }
            ]
        }
    ];

    for (const section of sections) {
        // Find or create Tag
        let tag = await Tag.findOne({ slug: section.tagSlug });
        if (!tag) {
            tag = await Tag.create({
                name: section.tagName,
                slug: section.tagSlug,
                description: `Packages for ${section.tagName}`,
                image: section.tagImage,
                packages: []
            });
        }

        const packageIds = [];
        for (const pkg of section.packages) {
            const newPkg = await AllPackage.findOneAndUpdate(
                { slug: pkg.slug },
                {
                    name: pkg.name,
                    slug: pkg.slug,
                    description: `Experience ${pkg.name}`,
                    shortDescription: `Enjoy ${pkg.name}`,
                    image: pkg.image,
                    location: pkg.location,
                    country: pkg.country,
                    tourType: pkg.country === "India" ? "india" : "international",
                    price: 20000,
                    duration: "4 Days",
                    isActive: true
                },
                { upsert: true, new: true }
            );
            packageIds.push(newPkg._id);
        }

        tag.packages = [...new Set([...tag.packages.map(p => p.toString()), ...packageIds.map(p => p.toString())])];
        await tag.save();
        console.log(`Seeded ${section.tagName} section with ${section.packages.length} packages.`);
    }

    console.log("Remaining sections seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed remaining sections", error);
    process.exit(1);
  }
};

runSeed();
