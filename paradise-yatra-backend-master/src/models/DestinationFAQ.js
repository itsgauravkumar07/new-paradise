const mongoose = require('mongoose');

const FAQEntrySchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
});

const DestinationFAQSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    tourType: {
        type: String,
        required: true,
        enum: ['india', 'international'],
        lowercase: true
    },
    faqs: {
        type: [FAQEntrySchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

function arrayLimit(val) {
    return val.length <= 5;
}

// Ensure destination is indexed for fast lookups
DestinationFAQSchema.index({ destination: 1, tourType: 1 });

module.exports = mongoose.model('DestinationFAQ', DestinationFAQSchema);
