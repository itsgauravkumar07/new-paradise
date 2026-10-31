const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: 6
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    picture: {
        type: String
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AllPackage'
    }]
}, {
    timestamps: true
});

// Hash password before saving
signupSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
signupSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Signup', signupSchema, 'signup-users'); 
