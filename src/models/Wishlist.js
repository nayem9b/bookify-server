const { z } = require('zod');
const { getDB } = require('../config/db');

const wishlistSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  bookId: z.string().min(1, 'Book ID is required'),
  addedAt: z.date().default(() => new Date()),
});

class Wishlist {
  static collection() {
    return getDB().collection('wishList');
  }

  static async validate(data) {
    return wishlistSchema.safeParse(data);
  }

  static async addToWishlist(userId, bookId) {
    const validation = await this.validate({ userId, bookId });
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.error}`);
    }

    // Check if already in wishlist
    const existing = await this.collection().findOne({ userId, bookId });
    if (existing) {
      throw new Error('Book already in wishlist');
    }

    return this.collection().insertOne({
      userId,
      bookId,
      addedAt: new Date(),
    });
  }

  static async getUserWishlist(userId) {
    return this.collection()
      .aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: 'CategoryBooks',
            localField: 'bookId',
            foreignField: '_id',
            as: 'book',
          },
        },
        { $unwind: '$book' },
        { $sort: { addedAt: -1 } },
      ])
      .toArray();
  }

  static async removeFromWishlist(userId, bookId) {
    const result = await this.collection().deleteOne({ userId, bookId });
    if (result.deletedCount === 0) {
      throw new Error('Item not found in wishlist');
    }
    return result;
  }

  static async isInWishlist(userId, bookId) {
    const item = await this.collection().findOne({ userId, bookId });
    return !!item;
  }
}

module.exports = Wishlist;
