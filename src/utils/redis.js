const { createClient } = require('redis');
require('dotenv').config();

let client;

const connectRedis = async () => {
  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
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

const cacheData = async (key, data, ttl = 3600) => {
  // Redis caching disabled temporarily.
  // Original implementation (commented out) would store the data in Redis:
  // // Default TTL: 1 hour
  // const client = getClient();
  // await client.setEx(key, ttl, JSON.stringify(data));
  // No-op return to avoid errors when Redis is unavailable.
  return;
};

const getCachedData = async (key) => {
  // Redis caching disabled temporarily.
  // Original implementation (commented out) would read from Redis:
  // const client = getClient();
  // const data = await client.get(key);
  // return data ? JSON.parse(data) : null;
  // Return null to indicate cache miss and continue normal flow.
  return null;
};

module.exports = {
  connectRedis,
  getClient,
  cacheData,
  getCachedData,
};
