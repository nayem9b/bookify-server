const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

// User routes
router.post('/', authenticate, bookingController.createBooking);
router.get('/my-bookings', authenticate, bookingController.getUserBookings);

// Admin routes
router.get('/', bookingController.getAllBookings);
router.put('/:id/status', authenticate, authorize(['admin']), bookingController.updateBookingStatus);

module.exports = router;
