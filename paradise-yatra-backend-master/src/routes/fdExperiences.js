const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const { SECTION_PERMISSIONS } = require('../config/roles');
const {
  getPublicExperiences,
  getAllExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/fdExperienceController');

// Same staff roles that manage fixed departures
const staff = requireRole(SECTION_PERMISSIONS.fixedDepartures);

// Public
router.get('/', getPublicExperiences);

// Staff
router.get('/admin/all', staff, getAllExperiences);
router.post('/', staff, auditLogger('fd-experiences'), createExperience);
router.put('/:id', staff, auditLogger('fd-experiences'), updateExperience);
router.delete('/:id', staff, deleteExperience);

module.exports = router;
