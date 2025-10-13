const { createClient } = require('redis');
require('dotenv').config();

let client;

const connectRedis = async () => {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => console.log('Redis Client Error', err));
  
  await client.connect();
  console.log('Connected to Redis');
  return client;
};

const getClient = () => {
  if (!client) {
    throw new Error('Redis client not connected');
  }
  return client;
};

const cacheData = async (key, data, ttl = 3600) => { // Default TTL: 1 hour
  const client = getClient();
  await client.setEx(key, ttl, JSON.stringify(data));
};

const getCachedData = async (key) => {
  const client = getClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

module.exports = {
  connectRedis,
  getClient,
  cacheData,
  getCachedData
};