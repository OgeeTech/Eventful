import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// 1. Create the Client (Export as NAMED export)
export const redisClient = createClient({
    // Checks for Upstash URL first, then generic REDIS_URL, then localhost
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

// 2. Connect Function (For server.ts)
export const connectRedis = async () => {
    try {
        // Only connect if not already open
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
};