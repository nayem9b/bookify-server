const express = require('express');
const router = express.Router();

// Import route files
const categoryRoutes = require('./categoryRoutes');
const bookRoutes = require('./bookRoutes');
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;
