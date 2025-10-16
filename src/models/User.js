const { z } = require('zod');
const { ObjectId } = require("mongodb");
const { getDB } = require('../config/db');

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  // password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin', 'seller']).default('user'),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
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
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static async findByEmail(email) {
    return this.collection().findOne({ email });
  }

  static async findById(id) {
    console.log("I'm inside static",id);
    return this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async update(id, updateData) {
    const validation = await this.validate(updateData);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }
    return this.collection().updateOne(
      { _id: id },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

module.exports = User;
