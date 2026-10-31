const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// POST /api/newsletter — save email to newsletter-subscriptions collection
router.post('/', async (req, res) => {
    try {
        const { email, source } = req.body;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }

        const db = mongoose.connection.db;
        const collection = db.collection('newsletter-subscriptions');

        // Prevent duplicate subscriptions
        const existing = await collection.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(200).json({ message: 'You are already subscribed!' });
        }

        await collection.insertOne({
            email: email.toLowerCase().trim(),
            subscribedAt: new Date(),
            source: source || 'website-newsletter',
            active: true,
        });

        return res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return res.status(500).json({ message: 'Internal server error. Please try again.' });
    }
});

// GET /api/newsletter — list all subscribers (admin use)
router.get('/', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('newsletter-subscriptions');
        const subscribers = await collection.find({}).sort({ subscribedAt: -1 }).toArray();
        return res.status(200).json({ subscribers, total: subscribers.length });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
