const express = require('express');
const router = express.Router();
const { adminAuth, requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const {
  getFooterContent,
  getAllFooterContent,
  createFooterContent,
  updateFooterContent,
  deleteFooterContent,
  toggleFooterContentStatus
} = require('../controllers/footerController');

// Public routes
router.get('/', getFooterContent);

// Admin routes
router.get('/admin/all', requireRole(['developer']), getAllFooterContent);
router.post('/admin', requireRole(['developer']), auditLogger('footer'), createFooterContent);
router.put('/admin/:id', requireRole(['developer']), auditLogger('footer'), updateFooterContent);
router.delete('/admin/:id', adminAuth, deleteFooterContent);
router.put('/admin/:id/toggle-status', adminAuth, toggleFooterContentStatus);

module.exports = router;
