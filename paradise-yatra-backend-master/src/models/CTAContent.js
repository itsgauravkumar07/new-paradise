const mongoose = require('mongoose');

const ctaContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  backgroundImage: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: "Start Your Journey"
  },
  buttonLink: {
    type: String,
    default: "/packages"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CTAContent', ctaContentSchema);