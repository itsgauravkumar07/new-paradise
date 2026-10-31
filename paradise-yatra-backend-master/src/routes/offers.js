const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { SECTION_PERMISSIONS } = require('../config/roles');
const {
  getActiveOffers,
  getActiveBar,
  listOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getBarAdmin,
  saveBar,
} = require('../controllers/offerController');

const offerManagers = requireRole(SECTION_PERMISSIONS.offers);

// Public
router.get('/', getActiveOffers);
router.get('/bar', getActiveBar);

// Admin
router.get('/admin/all', offerManagers, listOffers);
router.get('/admin/bar', offerManagers, getBarAdmin);
router.put('/admin/bar', offerManagers, auditLogger('offerBar'), saveBar);
router.post('/admin', offerManagers, auditLogger('offers'), createOffer);
router.put('/admin/:id', offerManagers, auditLogger('offers'), updateOffer);
router.delete('/admin/:id', offerManagers, deleteOffer);

module.exports = router;
