// const Category = require('../models/Category');

// class CategoryService {
//   static async createCategory(categoryData) {
//     try {
//       const result = await Category.create(categoryData);
//       return { success: true, data: result.ops[0] };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async getAllCategories(includeInactive = false) {
//     try {
//       const categories = await Category.findAll(includeInactive);
//       return { success: true, data: categories };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async getCategoryById(id) {
//     try {
//       const category = await Category.findById(id);
//       if (!category) {
//         return { success: false, error: 'Category not found', status: 404 };
//       }
//       return { success: true, data: category };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async updateCategory(id, updateData) {
//     try {
//       const result = await Category.update(id, updateData);
//       if (result.matchedCount === 0) {
//         return { success: false, error: 'Category not found', status: 404 };
//       }
//       const updatedCategory = await Category.findById(id);
//       return { success: true, data: updatedCategory };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async deleteCategory(id) {
//     try {
//       const result = await Category.delete(id);
//       if (result.deletedCount === 0) {
//         return { success: false, error: 'Category not found', status: 404 };
//       }
//       return { success: true, message: 'Category deleted successfully' };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }

//   static async toggleCategoryStatus(id, isActive) {
//     try {
//       const result = await Category.updateStatus(id, isActive);
//       if (result.matchedCount === 0) {
//         return { success: false, error: 'Category not found', status: 404 };
//       }
//       const updatedCategory = await Category.findById(id);
//       return {
//         success: true,
//         data: updatedCategory,
//         message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`
//       };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
// }

// module.exports = CategoryService;
