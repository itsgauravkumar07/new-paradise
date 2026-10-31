const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

// All wishlist routes are protected
router.use(auth);

// @route   GET /api/wishlist
router.get('/', getWishlist);

// @route   POST /api/wishlist/toggle
router.post('/toggle', toggleWishlist);

module.exports = router;
