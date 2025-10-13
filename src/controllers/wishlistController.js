const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

const wishlistController = {
  // Add book to wishlist
  addToWishlist: async (req, res, next) => {
    try {
      const { bookId } = req.body;
      const userId = req.user.userId;

      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Add to wishlist
      await Wishlist.addToWishlist(userId, bookId);
      
      res.status(201).json({ 
        message: 'Book added to wishlist',
        wishlistItem: { bookId, userId }
      });
    } catch (error) {
      if (error.message === 'Book already in wishlist') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  // Get user's wishlist
  getWishlist: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const wishlist = await Wishlist.getUserWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      next(error);
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.userId;

      await Wishlist.removeFromWishlist(userId, bookId);
      res.json({ message: 'Book removed from wishlist' });
    } catch (error) {
      if (error.message === 'Item not found in wishlist') {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  // Check if book is in wishlist
  checkInWishlist: async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.userId;
      
      const isInWishlist = await Wishlist.isInWishlist(userId, bookId);
      res.json({ inWishlist: isInWishlist });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = wishlistController;
