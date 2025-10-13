const Booking = require('../models/Booking');
const Book = require('../models/Book');

const bookingController = {
  // Create a new booking
  createBooking: async (req, res, next) => {
    try {
      const { bookId } = req.body;
      const userId = req.user.userId;

      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Create booking
      const returnDate = new Date();
      returnDate.setDate(returnDate.getDate() + 14); // 2 weeks from now

      const newBooking = await Booking.create({
        bookId,
        userId,
        returnDate,
        status: 'pending'
      });

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: newBooking.insertedId,
          bookId,
          userId,
          returnDate,
          status: 'pending'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's bookings
  getUserBookings: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const bookings = await Booking.findByUserId(userId);
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },

  // Update booking status (admin only)
  updateBookingStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      const updatedBooking = await Booking.updateStatus(id, status);
      if (!updatedBooking.matchedCount) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Get all bookings (admin only)
  getAllBookings: async (req, res, next) => {
    try {
      const bookings = await Booking.collection().find().toArray();
      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bookingController;
