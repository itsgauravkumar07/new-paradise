const express = require('express');
const router = express.Router();
const { createLead, getAllLeads, updateLeadStatus, updateFollowUpDate, deleteLead } = require('../controllers/leadController');
const { adminAuth } = require('../middleware/auth');

// Public route to capture lead
router.post('/', createLead);

// Admin routes
router.get('/', adminAuth, getAllLeads);
router.patch('/:id/status', adminAuth, updateLeadStatus);
router.patch('/:id/followup', adminAuth, updateFollowUpDate);
router.delete('/:id', adminAuth, deleteLead);

module.exports = router;
