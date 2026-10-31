const express = require('express');
const router = express.Router();
const DestinationFAQ = require('../models/DestinationFAQ');
const { adminAuth } = require('../middleware/auth');


// Public route to get FAQs for a specific destination
router.get('/', async (req, res) => {
    try {
        const { destination, tourType } = req.query;

        if (!destination || !tourType) {
            return res.status(400).json({
                success: false,
                message: 'Destination and tour type are required'
            });
        }

        const faqDoc = await DestinationFAQ.findOne({
            destination: destination.toLowerCase(),
            tourType: tourType.toLowerCase(),
            isActive: true
        });

        res.json({
            success: true,
            destinationFaq: faqDoc
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Admin: Create new destination FAQ document
router.post('/', adminAuth, async (req, res) => {

    try {
        const { destination, tourType, faqs, isActive } = req.body;

        const existing = await DestinationFAQ.findOne({
            destination: destination.toLowerCase(),
            tourType: tourType.toLowerCase()
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'FAQs already exist for this destination. Use update instead.'
            });
        }

        const newDoc = new DestinationFAQ({
            destination: destination.toLowerCase(),
            tourType: tourType.toLowerCase(),
            faqs,
            isActive
        });

        await newDoc.save();
        res.status(201).json({ success: true, destinationFaq: newDoc });
    } catch (error) {
        console.error('Error creating FAQs:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Admin: Update existing destination FAQ document
router.put('/:id', adminAuth, async (req, res) => {
    console.log(`[PUT] Update request for ID: ${req.params.id}, faqs count: ${req.body?.faqs?.length}`);
    try {
        const { faqs, isActive } = req.body;

        const updateData = {};
        if (faqs !== undefined) updateData.faqs = faqs;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedDoc = await DestinationFAQ.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedDoc) {
            console.warn(`[PUT] Document with ID ${req.params.id} not found`);
            return res.status(404).json({ success: false, message: 'FAQ document not found' });
        }

        console.log(`[PUT] Successfully updated document ${req.params.id}`);
        res.json({ success: true, destinationFaq: updatedDoc });
    } catch (error) {
        console.error('[PUT] Error in PUT route:', error);
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
});

// Admin: Delete entire destination FAQ document
router.delete('/:id', adminAuth, async (req, res) => {
    console.log(`[DELETE] Request to delete document with ID: ${req.params.id}`);
    try {
        const deletedDoc = await DestinationFAQ.findByIdAndDelete(req.params.id);

        if (!deletedDoc) {
            console.warn(`[DELETE] Document with ID ${req.params.id} not found`);
            return res.status(404).json({ success: false, message: 'FAQ document not found' });
        }

        console.log(`[DELETE] Successfully deleted document ${req.params.id}`);
        res.json({ success: true, message: 'Destination FAQs deleted successfully' });
    } catch (error) {
        console.error('[DELETE] Error in DELETE route:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
