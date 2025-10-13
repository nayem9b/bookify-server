const { z } = require('zod');
const { getDB } = require('../config/db');

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new()),
  updatedAt: z.date().default(() => new())
});

class Category {
  static collection() {
    return getDB().collection('Categories');
  }

  static async validate(data) {
    return categorySchema.safeParse(data);
  }

  static async create(categoryData) {
    const validation = await this.validate(categoryData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    
    const now = new Date();
    return this.collection().insertOne({
      ...categoryData,
      createdAt: now,
      updatedAt: now
    });
  }

  static async findAll(includeInactive = false) {
    const query = includeInactive ? {} : { isActive: true };
    return this.collection().find(query).sort({ name: 1 }).toArray();
  }

  static async findById(id) {
    return this.collection().findOne({ _id: id });
  }

  static async update(id, updateData) {
    const validation = await this.validate(updateData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    return this.collection().updateOne(
      { _id: id },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      }
    );
  }

  static async delete(id) {
    // Soft delete by setting isActive to false
    return this.collection().updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date() 
        } 
      }
    );
  }

  static async getBooksByCategory(categoryId) {
    return getDB().collection('CategoryBooks')
      .find({ categories: categoryId, isActive: true })
      .toArray();
  }
}

module.exports = Category;
