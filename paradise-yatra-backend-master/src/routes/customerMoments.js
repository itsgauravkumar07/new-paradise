const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { SECTION_PERMISSIONS } = require('../config/roles');
const { getMoments, listMoments, createMoment, updateMoment, deleteMoment } = require('../controllers/customerMomentController');

const galleryManagers = requireRole(SECTION_PERMISSIONS.customerMoments);

// Public
router.get('/', getMoments);

// Admin
router.get('/admin/all', galleryManagers, listMoments);
router.post('/admin', galleryManagers, auditLogger('customerMoments'), createMoment);
router.put('/admin/:id', galleryManagers, auditLogger('customerMoments'), updateMoment);
router.delete('/admin/:id', galleryManagers, deleteMoment);

module.exports = router;
