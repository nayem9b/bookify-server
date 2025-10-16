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
// GET /:id -> fetch user by id
router.get('/:id', userController.getUserById);
router.get('/profile',  userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

module.exports = router;
