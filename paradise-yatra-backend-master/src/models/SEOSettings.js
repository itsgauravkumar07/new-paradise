const mongoose = require("mongoose");

const seoSettingsSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    ogImage: {
      type: String,
      trim: true,
    },
    canonical: {
      type: String,
      required: true,
      trim: true,
      default: "/",
    },
    robots: {
      type: String,
      default: "index,follow",
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
seoSettingsSchema.index({ page: 1 });

module.exports = mongoose.model("SEOSettings", seoSettingsSchema);
