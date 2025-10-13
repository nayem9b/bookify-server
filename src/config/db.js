const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dafmrk2.mongodb.net/?retryWrites=true&w=majority`;

let client;
let db;

const connectDB = async () => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('Books');
    console.log('MongoDB connected successfully');
    return { client, db };
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
