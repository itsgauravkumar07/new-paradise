const mongoose = require('mongoose');

const headerContentSchema = new mongoose.Schema({
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    }
  },
  trustIndicators: [{
    icon: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      required: true,
      trim: true
    }
  }],
  navigation: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    submenu: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      href: {
        type: String,
        required: true,
        trim: true
      }
    }]
  }],
  logo: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HeaderContent', headerContentSchema);
