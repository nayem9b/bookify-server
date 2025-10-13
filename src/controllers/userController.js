const User = require('../models/User');
const { generateToken } = require('../utils/auth');

const userController = {
  // Register a new user
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const newUser = await User.create({
        email,
        password, // In a real app, hash the password before saving
        name,
        role: 'user'
      });

      // Generate JWT token
      const token = generateToken({ 
        userId: newUser.insertedId,
        email,
        role: 'user' 
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.insertedId,
          email,
          name,
          role: 'user'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password (in a real app, use bcrypt.compare)
      const isPasswordValid = user.password === password;
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user profile
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove sensitive data before sending response
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const updatedUser = await User.update(req.user.userId, {
        name,
        email,
        updatedAt: new Date()
      });

      if (!updatedUser.matchedCount) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
