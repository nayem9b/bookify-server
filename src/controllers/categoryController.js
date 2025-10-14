const Category = require('../models/Category');

const categoryController = {
  // Create a new category (Admin only)
  createCategory: async (req, res, next) => {
    try {
      const { name, description, imageUrl } = req.body;
      
      const newCategory = await Category.create({
        name,
        description,
        imageUrl,
        isActive: true
      });

      res.status(201).json({
        message: 'Category created successfully',
        category: {
          id: newCategory.insertedId,
          name,
          description,
          imageUrl
        }
      });
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      next(error);
    }
  },

  // Get all categories
  getAllCategories: async (req, res, next) => {
    try {
      const categories = await Category.findAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  // Get category by ID
  getCategoryById: async (req, res, next) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  // Update category (Admin only)
  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, isActive } = req.body;

      const updatedCategory = await Category.update(id, {
        name,
        description,
        imageUrl,
        isActive
      });

      if (!updatedCategory.matchedCount) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Delete category (Soft delete, Admin only)
  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Category.delete(id);
      
      if (!result.matchedCount) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Get books by category
  getBooksByCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const books = await Category.getBooksByCategory(id);
      res.json(books);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
