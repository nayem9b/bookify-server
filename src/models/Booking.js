const { z } = require('zod');
const { getDB } = require('../config/db');

const bookingSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  bookingDate: z.date().default(() => new Date()),
  returnDate: z.date(),
  status: z.enum(['pending', 'approved', 'rejected', 'returned']).default('pending'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

class Booking {
  static collection() {
    const myDB= getDB().collection('all_books');
    console.log(myDB);
  }

  static async validate(data) {
    return bookingSchema.safeParse(data);
  }

  static async create(bookingData) {
    const validation = await this.validate(bookingData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    return this.collection().insertOne({
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static async findByUserId(userId) {
    return this.collection().find({ userId }).toArray();
  }

  static async findById(id) {
    return this.collection().findOne({ _id: id });
  }

  static async updateStatus(id, status) {
    return this.collection().updateOne(
      { _id: id },
      { 
        $set: { 
          status,
          updatedAt: new Date() 
        } 
      }
    );
  }
}

module.exports = Booking;
