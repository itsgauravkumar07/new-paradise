const mongoose = require("mongoose");

const holidayTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    travelers: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: false,
      trim: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    tourType: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: String,
      required: false,
      trim: true,
      enum: [
        "Beach Holidays",
        "Adventure Tours",
        "Trending Destinations",
        "Premium Packages",
        "Popular Packages",
        "Fixed Departure",
        "Mountain Treks",
        "Wildlife Safaris",
        "Pilgrimage Tours",
        "Honeymoon Packages",
        "Family Tours",
        "Luxury Tours",
        "Budget Tours",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    highlights: [
      {
        type: String,
      },
    ],
    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],
    exclusions: [
      {
        type: String,
        trim: true,
      },
    ],
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        activities: [
          {
            type: String,
            required: true,
          },
        ],
        accommodation: {
          type: String,
          required: false,
        },
        meals: {
          type: String,
          required: false,
        },
        image: {
          type: String,
          default:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from title
holidayTypeSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("HolidayType", holidayTypeSchema);
