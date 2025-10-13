const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Add to wishlist
router.post('/', wishlistController.addToWishlist);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Remove from wishlist
router.delete('/:bookId', wishlistController.removeFromWishlist);

// Check if book is in wishlist
router.get('/check/:bookId', wishlistController.checkInWishlist);

module.exports = router;
