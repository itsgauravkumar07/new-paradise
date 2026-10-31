const express = require('express');
const router = express.Router();
const {
    getAllPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage,
    exportPackages
} = require('../controllers/allPackageController');
const { adminAuth, requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { uploadSingleImage } = require('../middleware/upload'); // Using existing upload middleware

// Public routes
router.get('/', getAllPackages);
router.post('/export', adminAuth, exportPackages);
router.get('/:id', getPackage);

// Admin routes
router.post('/', requireRole(['developer', 'packageManager']), uploadSingleImage, auditLogger('packages'), createPackage);
router.put('/:id', requireRole(['developer', 'packageManager']), uploadSingleImage, auditLogger('packages'), updatePackage);
router.delete('/:id', adminAuth, deletePackage);

module.exports = router;
