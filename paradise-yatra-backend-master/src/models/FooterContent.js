const mongoose = require('mongoose');

const footerContentSchema = new mongoose.Schema({
  companyInfo: {
    name: {
      type: String,
      required: true,
      default: "Paradise Yatra"
    },
    description: {
      type: String,
      required: true,
      default: "Your trusted partner for unforgettable travel experiences. We specialize in creating personalized journeys that combine adventure, culture, and luxury."
    },
    address: {
      type: String,
      required: true,
      default: "48, General Mahadev Singh Rd, Dehradun, Uttarakhand 248001"
    },
    phone: {
      type: String,
      required: true,
      default: "+91 8979396413"
    },
    email: {
      type: String,
      required: true,
      default: "info@paradiseyatra.com"
    },
    whatsapp: {
      type: String,
      required: true,
      default: "+91 9873391733"
    }
  },
  links: {
    international: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      }
    }],
    india: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      }
    }],
    trekking: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      }
    }],
    quickLinks: [{
      name: {
        type: String,
        required: true
      },
      href: {
        type: String,
        required: true
      }
    }]
  },
  socialMedia: [{
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin']
    },
    url: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create default footer content if none exists
footerContentSchema.statics.getDefaultContent = function() {
  return {
    companyInfo: {
      name: "Paradise Yatra",
      description: "Your trusted partner for unforgettable travel experiences. We specialize in creating personalized journeys that combine adventure, culture, and luxury.",
      address: "48, General Mahadev Singh Rd, Dehradun, Uttarakhand 248001",
      phone: "+91 8979396413",
      email: "info@paradiseyatra.com",
      whatsapp: "+91 9873391733"
    },
    links: {
      international: [
        { name: "Singapore", href: "#" },
        { name: "Thailand", href: "#" },
        { name: "Malaysia", href: "#" },
        { name: "Vietnam", href: "#" },
        { name: "Europe", href: "#" },
        { name: "Dubai", href: "#" },
        { name: "Maldives", href: "#" }
      ],
      india: [
        { name: "Rajasthan", href: "#" },
        { name: "Kerala", href: "#" },
        { name: "Himachal", href: "#" },
        { name: "Uttarakhand", href: "#" },
        { name: "Goa", href: "#" },
        { name: "Kashmir", href: "#" }
      ],
      trekking: [
        { name: "Kedarnath", href: "#" },
        { name: "Badrinath", href: "#" },
        { name: "Valley of Flowers", href: "#" },
        { name: "Roopkund", href: "#" },
        { name: "Har Ki Dun", href: "#" }
      ],
      quickLinks: [
        { name: "Home", href: "#" },
        { name: "About Us", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms & Conditions", href: "#" }
      ]
    },
    socialMedia: [
      { platform: "facebook", url: "#", isActive: true },
      { platform: "twitter", url: "#", isActive: true },
      { platform: "instagram", url: "#", isActive: true },
      { platform: "youtube", url: "#", isActive: true },
      { platform: "linkedin", url: "#", isActive: true }
    ],
    isActive: true
  };
};

module.exports = mongoose.model('FooterContent', footerContentSchema);
