const Book = require('../models/Book');

const bookController = {
  // Get all books
  getAllBooks: async (req, res, next) => {
    try {
      const books = await Book.findAll();
      res.json(books);
    } catch (error) {
      next(error);
    }
  },

  // Get single book by ID
  getBookById: async (req, res, next) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
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
  }
};

module.exports = bookController;
