const mongoose = require('mongoose');

const fixedDepartureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  duration: {
    type: String,
    required: true
  },
  destination: {
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
  // New field: State for India tours
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
  departureDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  images: [{
    type: String,
    required: true
  }],
  highlights: [{
    type: String
  }],
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
      default: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  }],
  inclusions: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  terms: [{
    type: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  departures: [{
    date: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    seats: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'soldout'],
      default: 'available'
    }
  }]
}, {
  timestamps: true
});

// Virtual for discounted price
fixedDepartureSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for seats remaining
fixedDepartureSchema.virtual('seatsRemaining').get(function () {
  return this.availableSeats;
});

// Virtual for booking percentage
fixedDepartureSchema.virtual('bookingPercentage').get(function () {
  return ((this.totalSeats - this.availableSeats) / this.totalSeats) * 100;
});

// Ensure virtual fields are serialized
fixedDepartureSchema.set('toJSON', { virtuals: true });
fixedDepartureSchema.set('toObject', { virtuals: true });

// Add indexes for better search performance
fixedDepartureSchema.index({ title: 'text', description: 'text', destination: 'text' });
fixedDepartureSchema.index({ isActive: 1 });
fixedDepartureSchema.index({ title: 1 });
fixedDepartureSchema.index({ destination: 1 });
fixedDepartureSchema.index({ departureDate: 1 });
fixedDepartureSchema.index({ status: 1 });
fixedDepartureSchema.index({ holidayType: 1 });
fixedDepartureSchema.index({ country: 1 });
fixedDepartureSchema.index({ state: 1 });
fixedDepartureSchema.index({ tourType: 1 });
fixedDepartureSchema.index({ category: 1 });
fixedDepartureSchema.index({ tourType: 1, country: 1 }); // Compound index for tour type + country filtering
fixedDepartureSchema.index({ tourType: 1, state: 1 }); // Compound index for tour type + state filtering
fixedDepartureSchema.index({ country: 1, state: 1 }); // Compound index for country + state filtering

module.exports = mongoose.model('FixedDeparture', fixedDepartureSchema);
