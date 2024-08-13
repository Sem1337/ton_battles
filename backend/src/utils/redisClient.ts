// utils/redisClient.js
import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://redis:6379' });

// Handle Redis client connection events
redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();  // Ensure the client connects to Redis

export default redisClient;
