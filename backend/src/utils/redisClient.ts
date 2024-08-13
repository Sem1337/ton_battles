// utils/redisClient.js
import { Redis } from 'ioredis';

const redisClient = new Redis('redis://redis:6379');

// Handle Redis client connection events
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;
