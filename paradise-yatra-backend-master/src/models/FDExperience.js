const mongoose = require('mongoose');

// A past fixed-departure trip: the group's photos, the story of the trip, and reviews from the travellers.
// Shown on the Fixed Departures pages as social proof; managed in Admin > Past Group Trips.

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    location: { type: String, trim: true, maxlength: 80, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    text: { type: String, required: true, trim: true, maxlength: 1500 },
    photo: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const fdExperienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    destination: { type: String, required: true, trim: true, maxlength: 100 },
    tripDate: { type: String, trim: true, maxlength: 60, default: '' }, // e.g. "May 2026"
    duration: { type: String, trim: true, maxlength: 40, default: '' }, // e.g. "5N/6D"
    groupSize: { type: Number, min: 0, default: 0 },
    coverImage: { type: String, trim: true, required: true },
    gallery: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 12, 'A trip can have at most 12 gallery photos'],
    },
    story: { type: String, trim: true, maxlength: 3000, default: '' },
    highlights: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 8, 'A trip can have at most 8 highlights'],
    },
    videoUrl: { type: String, trim: true, default: '' }, // YouTube link
    reviews: {
      type: [reviewSchema],
      default: [],
      validate: [(v) => v.length <= 20, 'A trip can have at most 20 reviews'],
    },
    // Optional link to the departure this group travelled on
    fixedDeparture: { type: mongoose.Schema.Types.ObjectId, ref: 'FixedDeparture', default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

fdExperienceSchema.index({ isActive: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('FDExperience', fdExperienceSchema);
