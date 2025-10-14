const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `${process.env.DATABASE_URI}`;
console.log(uri)

let client;
let db;

const connectDB = async () => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('Bookify');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => db;
const getClient = () => client;

module.exports = {
  connectDB,
  getDB,
  getClient,
  db
};
