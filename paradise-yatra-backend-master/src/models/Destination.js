const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  // New field: Reference to HolidayType for better categorization
  holidayType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HolidayType',
    required: false
  },
  // New field: Country for international/national classification
  country: {
    type: String,
    required: true,
    trim: true
  },
  // New field: State for India destinations
  state: {
    type: String,
    required: false,
    trim: true
  },
  // New field: Tour type classification
  tourType: {
    type: String,
    enum: ['international', 'india'],
    required: true,
    default: 'india'
  },
  // New field: Category to match the centralized config
  category: {
    type: String,
    enum: ['Beach Holidays', 'Adventure Tours', 'Trending Destinations', 'Premium Packages', 'Popular Packages', 'Fixed Departure', 'Mountain Treks', 'Wildlife Safaris', 'Pilgrimage Tours', 'Honeymoon Packages', 'Family Tours', 'Luxury Tours', 'Budget Tours'],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  price: {
    type: Number,
    min: 0
  },
  duration: {
    type: String
  },
  highlights: [{
    type: String
  }],
  // New field: What's included in the package
  inclusions: [{
    type: String,
    trim: true
  }],
  // New field: What's excluded from the package
  exclusions: [{
    type: String,
    trim: true
  }],
  // New field: Itinerary for day-wise tour planning
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    activities: [{
      type: String,
      required: true
    }],
    accommodation: {
      type: String,
      required: false
    },
    meals: {
      type: String,
      required: false
    },
    image: {
      type: String,
      default: ""
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  visitCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
destinationSchema.index({ name: 'text', description: 'text', location: 'text' });
destinationSchema.index({ isActive: 1 });
destinationSchema.index({ name: 1 });
destinationSchema.index({ slug: 1 }); // Index for slug-based queries
destinationSchema.index({ location: 1 });
destinationSchema.index({ holidayType: 1 });
destinationSchema.index({ country: 1 });
destinationSchema.index({ state: 1 });
destinationSchema.index({ tourType: 1 });
destinationSchema.index({ category: 1 });
destinationSchema.index({ tourType: 1, country: 1 }); // Compound index for tour type + country filtering
destinationSchema.index({ tourType: 1, state: 1 }); // Compound index for tour type + state filtering
destinationSchema.index({ country: 1, state: 1 }); // Compound index for country + state filtering

module.exports = mongoose.model('Destination', destinationSchema); 