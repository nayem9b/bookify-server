const { z } = require('zod');
const { getDB } = require('../config/db');
const { ObjectId } = require("mongodb");
const bookSchema = z.object({
  _id: z.union([z.string(), z.number()]),
  title: z.string().min(1, 'Title is required'),
  isbn: z.string().min(1, 'ISBN is required'),
  pageCount: z.number().int().nonnegative(),
  publishedDate: z.object({
    $date: z.string().datetime()
  }),
  thumbnailUrl: z.string().url().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  status: z.string().optional(),
  authors: z.array(z.string()),
  categories: z.array(z.string())
});

class Book {
  static collection() {
    return getDB().collection('all_books');
  }

  // static async validate(data) {
  //   return bookSchema.safeParse(data);
  // }

  static async create(bookData) {
    const validation = await this.validate(bookData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    return this.collection().insertOne(bookData);
  }

  static async findById(id) {
    console.log(id);
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findAll() {
    return this.collection().find({}).toArray();
  }

  static async update(id, updateData) {
    const validation = await this.validate(updateData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    return this.collection().updateOne(
      { _id:  new ObjectId(id) },
      { $set: updateData }
    );
  }

  static async delete(id) {
    return this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Book;
