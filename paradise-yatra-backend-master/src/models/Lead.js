const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        default: ''
    },
    // A phone number or an email is required (chatbot visitors may share only their email)
    phone: {
        type: String,
        required: [
            function () {
                return !this.email;
            },
            'A phone number or an email is required'
        ],
        trim: true,
        default: ''
    },
    destination: {
        type: String,
        required: false,
        trim: true
    },
    // Website page of the destination/package the visitor enquired about (e.g. /package/india/kerala)
    destinationUrl: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    budget: {
        type: String,
        required: false,
        trim: true
    },
    message: {
        type: String,
        required: false,
        default: ''
    },
    departureDate: {
        type: String,
        required: false,
        trim: true
    },
    packageTitle: {
        type: String,
        required: false
    },
    packagePrice: {
        type: String,
        required: false
    },
    newsletterConsent: {
        type: Boolean,
        default: false
    },
    // Where the lead came from, e.g. "website" (enquiry forms) or "chatbot"
    source: {
        type: String,
        trim: true,
        default: 'website'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
        default: 'new'
    },
    followUpDate: {
        type: Date,
        required: false,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
