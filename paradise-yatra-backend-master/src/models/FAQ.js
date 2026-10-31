const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
faqSchema.index({ location: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
