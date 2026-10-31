const mongoose = require('mongoose');

// The announcement strip pinned to the top of every page ("FESTIVE SALE  Save up to 40% off ... 3d : 6h : 2m").
// A single document (key "main"), managed in Admin → Offers.
const offerBarSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    isActive: { type: Boolean, default: false },
    label: { type: String, trim: true, maxlength: 30, default: '' }, // e.g. "FESTIVE SALE"
    message: { type: String, trim: true, maxlength: 140, default: '' }, // **bold** marks highlights: "Save up to **40% off** on your trip"
    linkUrl: { type: String, trim: true, default: '' },
    ctaText: { type: String, trim: true, maxlength: 24, default: '' },
    theme: { type: String, enum: ['sunset', 'ocean', 'emerald', 'royal', 'festive'], default: 'sunset' },
    startsAt: { type: Date, default: null }, // shown from this moment (optional)
    endsAt: { type: Date, default: null }, // hidden after this moment; also drives the countdown
    showCountdown: { type: Boolean, default: true },
    updatedBy: { name: String, email: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfferBar', offerBarSchema);
