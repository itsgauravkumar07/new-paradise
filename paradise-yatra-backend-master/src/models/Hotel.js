const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' },
  address: { type: String, trim: true },
  pricePerNight: { type: Number, required: true, min: 0 },
  originalPricePerNight: { type: Number, min: 0 },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  features: [{ type: String }],
  amenities: [{ type: String }],
  images: [{ type: String }],
  contactPhone: { type: String, trim: true },
  contactEmail: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

hotelSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);