const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const {
  getAllHotels,
  getHotelBySlug,
  getAvailableCities,
  getHotelFilters,
  getAllHotelsAdmin,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const { createEnquiry, listEnquiries, updateEnquiry, deleteEnquiry } = require('../controllers/hotelEnquiryController');

// Who may manage what (admin always may). Keep in sync with config/roles.js
const hotelManagers = requireRole(['developer', 'packageManager']);
const enquiryManagers = requireRole([]); // admin only - same as the Queries section

// ---------- Public ----------
router.get('/', getAllHotels);
router.get('/cities', getAvailableCities);
router.get('/filters', getHotelFilters);
router.get('/slug/:slug', getHotelBySlug);
router.post('/enquiries', createEnquiry);

// ---------- Admin: enquiries ----------
router.get('/enquiries', enquiryManagers, listEnquiries);
router.patch('/enquiries/:id', enquiryManagers, updateEnquiry);
router.delete('/enquiries/:id', enquiryManagers, deleteEnquiry);

// ---------- Admin: hotels (keep '/:id' routes last) ----------
router.get('/admin/all', hotelManagers, getAllHotelsAdmin);
router.post('/', hotelManagers, auditLogger('hotels'), createHotel);
router.put('/:id', hotelManagers, auditLogger('hotels'), updateHotel);
router.delete('/:id', hotelManagers, deleteHotel);

module.exports = router;
