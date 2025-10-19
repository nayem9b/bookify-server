const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
// GET / -> fetch all users
router.get('/', userController.getAllUsers);
// GET /email/:email -> fetch user by email
router.get('/email/:email',userController.getUserByEmail);
// Role check endpoints
router.get('/admin/:email', userController.isAdmin);
router.get('/buyer/:email', userController.isBuyer);
router.get('/seller/:email', userController.isSeller);

// GET /:id -> fetch user by id
router.get('/:id', userController.getUserById);
router.get('/profile',  userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
// Admin actions: update or delete user by id
router.put('/:id', authenticate, userController.updateUserById);
router.delete('/:id', userController.deleteUserById);
// Suspend/Unsuspend seller (admin)
router.put('/suspend/:id', authenticate, userController.suspendSeller);
router.put('/unsuspend/:id', authenticate, userController.unsuspendSeller);
router.patch('/:id/wishlist', userController.updateUserWishlist);

module.exports = router;
