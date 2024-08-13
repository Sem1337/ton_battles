// utils/redisClient.js
import { Redis } from 'ioredis';

const redisClient = new Redis('redis://redis:6379');

// Handle Redis client connection events
redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();  // Ensure the client connects to Redis

export default redisClient;
