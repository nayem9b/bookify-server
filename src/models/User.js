const { z } = require('zod');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  // password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin', 'seller']).default('user'),
  suspendedUntil: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

class User {
  static collection() {
    return getDB().collection('signedUsers');
  }

  static async validate(data) {
    return userSchema.safeParse(data);
  }

  static async findAll() {
    return this.collection().find({}).toArray();
  }

  static async create(userData) {
    // const validation = await this.validate(userData);
    // if (!validation.success) {
    //   throw new Error(`Validation failed: ${validation.error}`);
    // }
    return this.collection().insertOne({
      ...userData,
      suspendedUntil: userData.suspendedUntil || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async findByEmail(email) {
    return this.collection().findOne({ email });
  }

  static async findById(id) {
    // Support both MongoDB ObjectId _id values and external UIDs (e.g. Firebase uid)
    const col = this.collection();
    if (!id) return null;
    try {
      // If id is a valid ObjectId string this will succeed
      return await col.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      // Fallback: try to find by a uid field (for users created via external auth)
      // This avoids throwing BSONError when the id is not a 24-char hex string.
      return await col.findOne({ uid: id });
    }
  }

  static async update(id, updateData) {
    // const validation = await this.validate(updateData);
    // if (!validation.success) {
    //   throw new Error(`Validation failed: ${validation.error}`);
    // }
    return this.collection().updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

module.exports = User;
