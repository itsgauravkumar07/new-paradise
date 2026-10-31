const express = require('express');
const router = express.Router();
const {
  appendMessages,
  getConversations,
  getChatbotEnquiries,
  getConversation,
  deleteConversation,
} = require('../controllers/chatConversationController');
const { adminAuth } = require('../middleware/auth');

// Public: the website chat widget appends its transcript
router.post('/:sessionId/messages', appendMessages);

// Admin
router.get('/', adminAuth, getConversations);
router.get('/enquiries', adminAuth, getChatbotEnquiries); // before /:id so "enquiries" isn't read as an id
router.get('/:id', adminAuth, getConversation);
router.delete('/:id', adminAuth, deleteConversation);

module.exports = router;
