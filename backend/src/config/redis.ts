import { createClient } from 'redis';

// Create a Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

// Function to start the connection
export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
};

export default redisClient;