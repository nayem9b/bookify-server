const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET /api/books - Get all books
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Get single book
router.get('/:id', bookController.getBookById);

// POST /api/books - Create new book
router.post('/', bookController.createBook);

// PUT /api/books/:id - Update book
router.put('/:id', bookController.updateBook);

// DELETE /api/books/:id - Delete book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
