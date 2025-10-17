const User = require('../models/User');
const { generateToken } = require('../utils/auth');

const userController = {
  // Register a new user
  register: async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      console.log(name, email, role);
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // // Create new user
      const newUser = await User.create({
        name,
        email,
        // password, // In a real app, hash the password before saving
        role: role
      });

      // Generate JWT token
      const token = generateToken({ 
        userId: newUser.insertedId,
        name : name,
        email :email,
        role: role 
      });

      res.status(201).json({
        message: 'User registered successfully',
        
        token,
        user: {
          id: newUser.insertedId,
          name : name,
          email: email,
          role: role
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

  // Get all users (admin-only in real apps)
  getAllUsers: async (req, res, next) => {
    try {
      // Support optional role filter (e.g. ?role=Seller or ?role=Buyer)
      const { role } = req.query;
      let users = await User.findAll();
      if (role) {
        users = users.filter((u) => u.role && u.role.toLowerCase() === role.toLowerCase());
      }
      // Strip passwords and any sensitive fields
      const safeUsers = users.map((u) => {
        const { password, ...rest } = u;
        return rest;
      });
      // Return as plain array for compatibility with frontend
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  },

  // Get user by email
  getUserByEmail: async (req, res, next) => {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      next(error);
    }
  },

  // Role check endpoints
  isAdmin: async (req, res, next) => {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);
      return res.json({ isAdmin: user?.role?.toString().toLowerCase() === 'admin' });
    } catch (error) {
      next(error);
    }
  },

  isBuyer: async (req, res, next) => {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);
      // Accept 'buyer' or generic 'user' as buyer role depending on DB conventions
      const role = user?.role?.toString().toLowerCase();
      return res.json({ isBuyer: role === 'buyer' || role === 'user' });
    } catch (error) {
      next(error);
    }
  },

  isSeller: async (req, res, next) => {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);
      return res.json({ isSeller: user?.role?.toString().toLowerCase() === 'seller' });
    } catch (error) {
      next(error);
    }
  },

  // Get user by id
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      next(error);
    }
  },

  // Update a user by id (admin action)
  updateUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Convert id to ObjectId where needed; User.update expects id as-is
      const result = await User.collection().updateOne(
        { _id: new (require('mongodb').ObjectId)(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated', modifiedCount: result.modifiedCount });
    } catch (error) {
      next(error);
    }
  },

  // Delete a user by id (admin action)
  deleteUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await User.collection().deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted' });
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
