const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['destination_overview', 'theme_overview', 'package_overview', 'other'],
    default: 'other'
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

pageContentSchema.index({ type: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
