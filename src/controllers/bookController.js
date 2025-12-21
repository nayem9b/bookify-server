const Book = require('../models/Book');
const { getCachedData, cacheData } = require('../utils/redis');
const CACHE_KEY = 'all_books';

const bookController = {
  // Get all books
  getAllBooks: async (req, res, next) => {
    try {
      // Try to get data from cache first
      const cachedData = await getCachedData(CACHE_KEY);
      if (cachedData) {
        console.log('Serving from cache');
        return res.status(200).json(cachedData);
      }

      // If not in cache, get from database
      console.log('Cache miss, querying database');
      const books = await Book.findAll();

      // Cache the data for future requests
      await cacheData(CACHE_KEY, books);

      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  },

  // Get single book by ID
  getBookById: async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log('Fetching book with ID:', id);

      if (!id) {
        return res.status(400).json({ message: 'Book ID is required' });
      }

      const book = await Book.findById(id);
      console.log('Book found:', book);

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      res.status(200).json(book);
    } catch (error) {
      console.error('Error in getBookById:', error.message);
      next(error);
    }
  },

  // Create a new book
  createBook: async (req, res, next) => {
    try {
      const newBook = await Book.create(req.body);
      res.status(201).json(newBook);
    } catch (error) {
      next(error);
    }
  },

  // Update a book
  updateBook: async (req, res, next) => {
    try {
      const updatedBook = await Book.update(req.params.id, req.body);
      if (!updatedBook.matchedCount) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Delete a book
  deleteBook: async (req, res, next) => {
    try {
      const result = await Book.delete(req.params.id);
      if (!result.deletedCount) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookController;
