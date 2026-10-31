const mongoose = require('mongoose');

// Offer cards shown on the home page ("Discounts & Offers") and the /hotels page, managed in Admin → Offers.
const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, maxlength: 200, default: '' },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, trim: true, default: '' }, // internal path ("/package/...") or full https URL
    // Ribbon on the image: package deal, hotel deal or a general offer
    type: { type: String, enum: ['package', 'hotel', 'general'], default: 'package' },
    discountText: { type: String, trim: true, maxlength: 40, default: '' }, // e.g. "Up to 40% off", "Flat ₹5,000 off"
    validUntil: { type: Date, default: null }, // hidden from the website after this moment
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
