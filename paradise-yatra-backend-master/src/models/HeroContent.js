const mongoose = require("mongoose");

const heroContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    backgroundImage: {
      type: String,
      required: true,
    },
    // backgroundImage: {
    //   asset_id: { type: String, required: true },
    //   secure_url: { type: String, required: true },
    //   public_id: { type: String, required: true },
    // },
    trustBadgeText: {
      type: String,
      default: "Trusted by 5000+ travelers",
    },
    popularDestinations: [
      {
        type: String,
        trim: true,
      },
    ],
    ctaButtonText: {
      type: String,
      default: "Explore Packages",
    },
    secondaryButtonText: {
      type: String,
      default: "Watch Video",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HeroContent", heroContentSchema);
