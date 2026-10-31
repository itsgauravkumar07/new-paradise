const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getHeaderContent,
  createHeaderContent,
  updateHeaderContent,
  deleteHeaderContent,
  getAllHeaderContent
} = require('../controllers/headerController');

// Public routes
router.get('/', getHeaderContent);

// Admin routes
router.get('/admin/all', adminAuth, getAllHeaderContent);
router.post('/', adminAuth, createHeaderContent);
router.put('/:id', adminAuth, updateHeaderContent);
router.delete('/:id', adminAuth, deleteHeaderContent);

module.exports = router;
