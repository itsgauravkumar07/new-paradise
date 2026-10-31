const mongoose = require('mongoose');

const ENQUIRY_STATUSES = ['new', 'contacted', 'booked', 'closed'];

const hotelEnquirySchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    hotelName: { type: String, trim: true, default: 'General hotel enquiry' },
    hotelSlug: { type: String, trim: true },
    city: { type: String, trim: true },

    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },

    checkIn: { type: Date },
    checkOut: { type: Date },
    adults: { type: Number, min: 1, max: 10, default: 2 },
    children: { type: Number, min: 0, max: 12, default: 0 },
    rooms: { type: Number, min: 1, max: 6, default: 1 },
    message: { type: String, trim: true, maxlength: 1000, default: '' },

    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new' },
    adminNotes: { type: String, trim: true, maxlength: 2000, default: '' },
    source: { type: String, default: 'hotel-page' },
    submittedAt: { type: Date, default: Date.now },
  },
  { collection: 'hotel-enquiries' }
);

hotelEnquirySchema.index({ submittedAt: -1 });
hotelEnquirySchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('HotelEnquiry', hotelEnquirySchema);
module.exports.ENQUIRY_STATUSES = ENQUIRY_STATUSES;
