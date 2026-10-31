require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const AllPackage = require("../models/AllPackage");

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing AllPackage data...");
    await AllPackage.deleteMany({});

    console.log("Inserting AllPackages...");
    await AllPackage.insertMany([
      {
        name: "Goa Beach Holiday",
        slug: "goa-beach-holiday",
        description: "Enjoy the beautiful beaches and nightlife of Goa.",
        shortDescription: "3 Days in Goa",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?w=800&q=80",
        location: "Goa",
        country: "India",
        state: "Goa",
        tourType: "india",
        price: 15000,
        duration: "3 Days / 2 Nights",
        isActive: true
      },
      {
        name: "Kerala Backwaters",
        slug: "kerala-backwaters",
        description: "Relax in the serene backwaters of Kerala.",
        shortDescription: "5 Days in Kerala",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
        location: "Kerala",
        country: "India",
        state: "Kerala",
        tourType: "india",
        price: 25000,
        duration: "5 Days / 4 Nights",
        isActive: true
      },
      {
        name: "Rajasthan Heritage Tour",
        slug: "rajasthan-heritage-tour",
        description: "Explore the majestic forts and palaces of Rajasthan.",
        shortDescription: "7 Days in Rajasthan",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80",
        location: "Jaipur",
        country: "India",
        state: "Rajasthan",
        tourType: "india",
        price: 35000,
        duration: "7 Days / 6 Nights",
        isActive: true
      },
      {
        name: "Kashmir Paradise",
        slug: "kashmir-paradise",
        description: "Experience the heaven on earth in Kashmir.",
        shortDescription: "6 Days in Kashmir",
        image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80",
        location: "Srinagar",
        country: "India",
        state: "Jammu and Kashmir",
        tourType: "india",
        price: 28000,
        duration: "6 Days / 5 Nights",
        isActive: true
      },
      {
        name: "Dubai Luxury Escape",
        slug: "dubai-luxury-escape",
        description: "Experience the futuristic city and desert safaris.",
        shortDescription: "5 Days in Dubai",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
        location: "Dubai",
        country: "UAE",
        tourType: "international",
        price: 65000,
        duration: "5 Days / 4 Nights",
        isActive: true
      },
      {
        name: "Bali Bliss",
        slug: "bali-bliss",
        description: "Relax in the beautiful tropical island of Bali.",
        shortDescription: "6 Days in Bali",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        location: "Bali",
        country: "Indonesia",
        tourType: "international",
        price: 55000,
        duration: "6 Days / 5 Nights",
        isActive: true
      },
      {
        name: "Swiss Alps Adventure",
        slug: "swiss-alps-adventure",
        description: "Explore the snowy mountains of Switzerland.",
        shortDescription: "7 Days in Switzerland",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
        location: "Zurich",
        country: "Switzerland",
        tourType: "international",
        price: 120000,
        duration: "7 Days / 6 Nights",
        isActive: true
      }
    ]);

    console.log("Dummy data seeding complete for AllPackages!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed AllPackages", error);
    process.exit(1);
  }
};

runSeed();
