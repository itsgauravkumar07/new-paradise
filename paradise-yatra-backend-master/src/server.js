const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   process.env.CLIENT_ORIGIN,
// ].filter(Boolean);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// Replace your CORS section with this:
const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // Production domain
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}`);
        callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    const start = Date.now();
    res.on('finish', () => {
        console.log(`[RES] ${req.method} ${req.url} ${res.statusCode} - ${Date.now() - start}ms`);
    });
    next();
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4, autoIndex: false });
    console.log("Connected to MongoDB Atlas successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

// Routes
const authRoutes = require("./routes/auth");
const packageRoutes = require("./routes/packages");
const destinationRoutes = require("./routes/destinations");
const blogRoutes = require("./routes/blogs");
const adminRoutes = require("./routes/admin");
const testimonialRoutes = require("./routes/testimonials");
const heroRoutes = require("./routes/hero");
const headerRoutes = require("./routes/header");
const ctaRoutes = require("./routes/cta");
const holidayTypeRoutes = require("./routes/holidayTypes");
const uploadRoutes = require("./routes/upload");
const fixedDepartureRoutes = require("./routes/fixedDepartures");
const footerRoutes = require("./routes/footer");
const locationRoutes = require("./routes/locations");
const seoRoutes = require("./routes/seo");
const faqRoutes = require("./routes/faq");

const tagRoutes = require("./routes/tags");
const leadRoutes = require("./routes/leads");
const wishlistRoutes = require("./routes/wishlist");
const allPackageRoutes = require("./routes/allPackages");
const purchaseRoutes = require("./routes/purchases");
const newsletterRoutes = require("./routes/newsletter");
const destinationFAQRoutes = require("./routes/destinationFAQs");
const contactFormRoutes = require("./routes/contactForm");
const pageContentRoutes = require("./routes/pageContent");
const hotelRoutes = require("./routes/hotels");
const chatConversationRoutes = require("./routes/chatConversations");
const fdExperienceRoutes = require("./routes/fdExperiences");
const legalPageRoutes = require("./routes/legalPages");
const offerRoutes = require("./routes/offers");
const customerMomentRoutes = require("./routes/customerMoments");



app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/all-packages", allPackageRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/header", headerRoutes);
app.use("/api/cta", ctaRoutes);
app.use("/api/holiday-types", holidayTypeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/fixed-departures", fixedDepartureRoutes);
app.use("/api/footer", footerRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/destination-faqs", destinationFAQRoutes);
app.use("/api/contact-form", contactFormRoutes);
app.use("/api/page-content", pageContentRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/chat-conversations', chatConversationRoutes);
app.use('/api/fd-experiences', fdExperienceRoutes);
app.use('/api/legal-pages', legalPageRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/customer-moments', customerMomentRoutes);



// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Paradise Yatra API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
        const newPort = PORT + 1;
        server.close();
        app.listen(newPort, () => {
          console.log(`Server is running on port ${newPort}`);
        });
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    function shutdown() {
      console.log('\nShutting down gracefully...');
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed');
          process.exit(0);
        } catch (error) {
          console.error('Error closing MongoDB:', error.message);
          process.exit(1);
        }
      });
    }

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
