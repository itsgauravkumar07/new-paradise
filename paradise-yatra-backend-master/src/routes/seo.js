const express = require('express');
const router = express.Router();
const { 
  getSEOSettings, 
  updateSEOSettings, 
  getAllSEOSettings, 
  deleteSEOSettings,
  getDynamicSEOSettings,
  updateDynamicSEOSettings
} = require('../controllers/seoController');
const { adminAuth, requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

// Get all SEO settings (admin only)
router.get('/', requireRole(['developer', 'marketer']), getAllSEOSettings);

// Get dynamic SEO settings for package pages
router.get('/packages-dynamic', requireRole(['developer', 'marketer']), getDynamicSEOSettings);

// Update dynamic SEO settings for package pages
router.put('/packages-dynamic', requireRole(['developer', 'marketer']), auditLogger('seo'), updateDynamicSEOSettings);

// Get SEO settings for a specific page
router.get('/:page', getSEOSettings);

// Update SEO settings for a specific page
router.put('/:page', requireRole(['developer', 'marketer']), auditLogger('seo'), updateSEOSettings);

// Delete SEO settings for a specific page (admin only)
router.delete('/:page', adminAuth, deleteSEOSettings);

module.exports = router;
