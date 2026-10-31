const mongoose = require('mongoose');

// Customer photos and videos ("Traveller moments"), managed in Admin → Customer Gallery.
// Shown on the home page (showOnHome), the /traveller-stories page, and on destination and package
// pages whose state/country matches `location`.
const customerMomentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['photo', 'video'], required: true },
    // The photo, or the cover image of a video (optional for YouTube and .mp4, which have their own)
    imageUrl: { type: String, trim: true, default: '' },
    // YouTube or Instagram link, or a direct .mp4 link / site path
    videoUrl: { type: String, trim: true, default: '' },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    // State or country as written on packages ("Kerala", "Jammu and Kashmir", "Thailand")
    location: { type: String, trim: true, maxlength: 80, default: '' },
    tripDate: { type: String, trim: true, maxlength: 30, default: '' }, // e.g. "Dec 2025"
    quote: { type: String, trim: true, maxlength: 220, default: '' },
    showOnHome: { type: Boolean, default: false },
    // The customer agreed to their photo/video being shared (required to save)
    consent: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerMomentSchema.index({ isActive: 1, location: 1 });

module.exports = mongoose.model('CustomerMoment', customerMomentSchema);
