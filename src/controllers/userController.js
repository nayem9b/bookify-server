const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const bcrypt = require('bcrypt');

const userController = {
  // Register a new user
  register: async (req, res, next) => {
    try {
      const { name, email, role, password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashed = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password: hashed,
        role: role
      });

      // Generate JWT token (do not include password)
      const token = generateToken({ 
        userId: newUser.insertedId,
        name,
        email,
        role
      });

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.insertedId,
          name,
          email,
          role
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

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password || '');
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
      const isSeller = user?.role?.toString().toLowerCase() === 'seller';
      const suspendedUntil = user?.suspendedUntil ? new Date(user.suspendedUntil) : null;
      const isSuspended = suspendedUntil ? suspendedUntil > new Date() : false;
      return res.json({ isSeller, isSuspended, suspendedUntil });
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

  // Suspend a seller for given duration (default 14 days)
  suspendSeller: async (req, res, next) => {
    try {
      const { id } = req.params;
      const days = parseInt(req.body.days, 10) || 14;
      const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const result = await User.collection().updateOne(
        { _id: new (require('mongodb').ObjectId)(id) },
        { $set: { suspendedUntil: until, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: `Seller suspended until ${until.toISOString()}`, suspendedUntil: until });
    } catch (error) {
      next(error);
    }
  },

  // Unsuspend a seller (clear suspension)
  unsuspendSeller: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await User.collection().updateOne(
        { _id: new (require('mongodb').ObjectId)(id) },
        { $unset: { suspendedUntil: "" }, $set: { updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'Seller unsuspended' });
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
  },

  // Update user wishlist
  updateUserWishlist: async (req, res) => {
    const { id } = req.params;
    const { wishlist } = req.body;
    console.log('Received body:', req.body);


    try {
      if (req.user && req.user.userId && req.user.userId.toString() !== id.toString()) {
        return res.status(403).json({ message: 'You are not allowed to modify this user\'s wishlist' });
      }

      const { ObjectId } = require('mongodb');
      if (Array.isArray(wishlist)) {
        const result = await User.collection().updateOne(
          { _id: new ObjectId(id) },
          { $set: { wishlist, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await User.findById(id);
        return res.status(200).json({ message: 'Wishlist updated successfully', wishlist: updatedUser.wishlist || [] });
      }

      // Single-item addition
      const { book, bookId } = req.body;
      if (!book && !bookId) {
        return res.status(400).json({ message: 'Request must include wishlist array or a book/bookId to add' });
      }

      const itemToAdd = book || { id: bookId };
      // Ensure the stored wishlist is an array. Some older documents may have wishlist as a string
      // which causes MongoDB to reject $addToSet. Normalize it to an array first.
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      try {
        if (existingUser.wishlist && !Array.isArray(existingUser.wishlist)) {
          // Attempt to parse JSON stringified array if possible, otherwise replace with empty array
          if (typeof existingUser.wishlist === 'string') {
            try {
              const parsed = JSON.parse(existingUser.wishlist);
              if (Array.isArray(parsed)) {
                await User.collection().updateOne(
                  { _id: new ObjectId(id) },
                  { $set: { wishlist: parsed, updatedAt: new Date() } }
                );
              } else {
                await User.collection().updateOne(
                  { _id: new ObjectId(id) },
                  { $set: { wishlist: [], updatedAt: new Date() } }
                );
              }
            } catch (parseErr) {
              // Not JSON — overwrite with empty array to allow $addToSet
              await User.collection().updateOne(
                { _id: new ObjectId(id) },
                { $set: { wishlist: [], updatedAt: new Date() } }
              );
            }
          } else {
            // Non-string/non-array (number, boolean, etc.) — reset to empty array
            await User.collection().updateOne(
              { _id: new ObjectId(id) },
              { $set: { wishlist: [], updatedAt: new Date() } }
            );
          }
        }

        const addResult = await User.collection().updateOne(
          { _id: new ObjectId(id) },
          { $addToSet: { wishlist: itemToAdd }, $set: { updatedAt: new Date() } }
        );

        if (addResult.matchedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
      } catch (updateErr) {
        console.error('Error when adding to wishlist, updateErr:', updateErr);
        // As a fallback, replace the wishlist with a single-item array
        try {
          await User.collection().updateOne(
            { _id: new ObjectId(id) },
            { $set: { wishlist: [itemToAdd], updatedAt: new Date() } }
          );
        } catch (fallbackErr) {
          console.error('Fallback error setting wishlist array:', fallbackErr);
          return res.status(500).json({ message: 'Error updating wishlist', error: String(fallbackErr) });
        }
      }
      const updatedUser2 = await User.findById(id);
      return res.status(200).json({ message: 'Wishlist updated successfully', wishlist: updatedUser2.wishlist || [] });
    } catch (error) {
      console.error('Error in updateUserWishlist:', error);
      res.status(500).json({ message: 'Error updating wishlist', error: error.message });
    }
  }
};

module.exports = userController;
