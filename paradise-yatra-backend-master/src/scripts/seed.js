require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");

// Models
const HolidayType = require("../models/HolidayType");
const Destination = require("../models/Destination");
const Package = require("../models/Package");
const HeroContent = require("../models/HeroContent");
const CTAContent = require("../models/CTAContent");
const Testimonial = require("../models/Testimonial");
const FAQ = require("../models/FAQ");
const Blog = require("../models/Blog");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

const runSeed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await HolidayType.deleteMany({});
  await Destination.deleteMany({});
  await Package.deleteMany({});
  await HeroContent.deleteMany({});
  await CTAContent.deleteMany({});
  await Testimonial.deleteMany({});
  await FAQ.deleteMany({});
  await Blog.deleteMany({});

  console.log("Inserting HolidayTypes...");
  const holidayTypes = await HolidayType.insertMany([
    {
      title: "Honeymoon Packages",
      slug: "honeymoon-packages",
      description: "Romantic getaways for couples",
      shortDescription: "Perfect romantic holidays",
      image: "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800&q=80",
      duration: "5-10 Days",
      travelers: "Couples",
      badge: "Popular",
      price: "₹45,000",
      category: "Honeymoon Packages",
      tourType: "international"
    },
    {
      title: "Adventure Tours",
      slug: "adventure-tours",
      description: "Thrilling adventures for adrenaline junkies",
      shortDescription: "Action-packed trips",
      image: "https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=800&q=80",
      duration: "3-7 Days",
      travelers: "Solo/Friends",
      badge: "Trending",
      price: "₹25,000",
      category: "Adventure Tours",
      tourType: "india"
    }
  ]);

  console.log("Inserting Destinations...");
  const destinations = await Destination.insertMany([
    {
      name: "Bali",
      slug: "bali",
      description: "An Indonesian paradise with lush landscapes, serene beaches, and vibrant culture.",
      shortDescription: "Tropical paradise in Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      location: "Indonesia",
      holidayType: holidayTypes[0]._id,
      country: "Indonesia",
      tourType: "international",
      category: "Honeymoon Packages",
      rating: 4.8,
      price: 65000,
      duration: "6 Days / 5 Nights",
      highlights: ["Ubud Monkey Forest", "Uluwatu Temple", "Tegallalang Rice Terrace"],
      isActive: true,
      isTrending: true
    },
    {
      name: "Manali",
      slug: "manali",
      description: "A high-altitude Himalayan resort town known for backpacking and honeymooning.",
      shortDescription: "Valley of Gods",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
      location: "Himachal Pradesh",
      holidayType: holidayTypes[1]._id,
      country: "India",
      state: "Himachal Pradesh",
      tourType: "india",
      category: "Adventure Tours",
      rating: 4.5,
      price: 25000,
      duration: "4 Days / 3 Nights",
      highlights: ["Solang Valley", "Rohtang Pass", "Hidimba Temple"],
      isActive: true,
      isTrending: true
    }
  ]);

  console.log("Inserting Packages...");
  await Package.insertMany([
    {
      title: "Romantic Escape to Bali",
      slug: "romantic-escape-bali",
      description: "Experience the ultimate romantic getaway in the beautiful island of Bali. Includes private villa with pool.",
      shortDescription: "6-day romantic holiday in Bali",
      price: 75000,
      originalPrice: 90000,
      discount: 16,
      duration: "6 Days / 5 Nights",
      destination: "Bali",
      category: "Honeymoon Packages",
      holidayType: holidayTypes[0]._id,
      country: "Indonesia",
      tourType: "international",
      images: [
        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80"
      ],
      highlights: ["Private Pool Villa", "Romantic Dinner on Beach", "Ubud Tour"],
      itinerary: [
        {
          day: 1,
          title: "Arrival in Bali",
          activities: ["Transfer to Villa", "Welcome Dinner"],
          accommodation: "Luxury Villa",
          meals: "Dinner"
        },
        {
          day: 2,
          title: "Ubud Culture Tour",
          activities: ["Visit Monkey Forest", "Rice Terraces", "Swing"],
          accommodation: "Luxury Villa",
          meals: "Breakfast, Lunch"
        }
      ],
      inclusions: ["Flights", "Accommodation", "Breakfast", "Airport Transfers"],
      exclusions: ["Visa", "Personal Expenses"],
      isActive: true,
      isFeatured: true
    },
    {
      title: "Manali Adventure Trip",
      slug: "manali-adventure-trip",
      description: "Thrilling adventure trip to Manali covering Solang valley sports and Rohtang pass snow points.",
      shortDescription: "Action-packed Manali trip",
      price: 22000,
      duration: "4 Days / 3 Nights",
      destination: "Manali",
      category: "Adventure Tours",
      holidayType: holidayTypes[1]._id,
      country: "India",
      state: "Himachal Pradesh",
      tourType: "india",
      images: [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80"
      ],
      highlights: ["Paragliding", "Snow Scooter", "Trekking"],
      itinerary: [
        {
          day: 1,
          title: "Reach Manali",
          activities: ["Check-in", "Local sightseeing"],
          accommodation: "3 Star Hotel",
          meals: "Dinner"
        }
      ],
      inclusions: ["Accommodation", "Breakfast", "Dinner", "Local Transport"],
      exclusions: ["Flights", "Adventure Sports Fees"],
      isActive: true,
      isFeatured: true
    }
  ]);

  console.log("Inserting HeroContent...");
  await HeroContent.insertMany([
    {
      title: "Discover Your Next Adventure",
      subtitle: "Paradise Yatra makes your dream holiday come true.",
      description: "Explore the world's most beautiful destinations with our curated packages.",
      backgroundImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
      trustBadgeText: "Trusted by 10,000+ travelers",
      popularDestinations: ["Bali", "Maldives", "Dubai", "Manali"],
      ctaButtonText: "Book Now",
      secondaryButtonText: "Explore More",
      isActive: true
    }
  ]);

  console.log("Inserting CTAContent...");
  await CTAContent.insertMany([
    {
      title: "Ready for your dream vacation?",
      description: "Get in touch with our travel experts to plan your perfect trip.",
      backgroundImage: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=80",
      buttonText: "Contact Us",
      buttonLink: "/contact",
      isActive: true
    }
  ]);

  console.log("Inserting Testimonials...");
  await Testimonial.insertMany([
    {
      name: "Rahul Sharma",
      location: "New Delhi",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "The Bali trip planned by Paradise Yatra was absolute perfection. Everything was seamless!",
      package: "Romantic Escape to Bali",
      date: "2023-10-15",
      verified: true,
      featured: true
    },
    {
      name: "Priya Singh",
      location: "Mumbai",
      rating: 4,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Had an amazing adventure trip to Manali. The guides were professional.",
      package: "Manali Adventure Trip",
      date: "2023-11-22",
      verified: true,
      featured: true
    }
  ]);

  console.log("Inserting FAQs...");
  await FAQ.insertMany([
    {
      question: "What is included in the tour packages?",
      answer: "Most of our packages include accommodation, daily breakfast, airport transfers, and local sightseeing. Please check the specific package details for full inclusions.",
      location: "general",
      isActive: true,
      order: 1
    },
    {
      question: "Do you help with visa processing?",
      answer: "Yes, we provide visa assistance for all international destinations we offer.",
      location: "general",
      isActive: true,
      order: 2
    }
  ]);

  console.log("Inserting Blogs...");
  await Blog.insertMany([
    {
      title: "Top 5 Places to Visit in Bali",
      slug: "top-5-places-bali",
      content: "<p>Bali is a beautiful island...</p><p>1. Ubud</p><p>2. Seminyak</p><p>3. Uluwatu</p>",
      excerpt: "Discover the best spots in Bali for your next vacation.",
      author: "Travel Expert",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
      category: "Travel Guides",
      isPublished: true,
      isFeatured: true
    }
  ]);

  console.log("Dummy data seeding complete!");
  process.exit(0);
};

runSeed();
