import redisClient from '../../config/redis';

// Set data in Cache (expires in 1 hour by default)
export const setCache = async (key: string, data: any, ttl: number = 3600) => {
    try {
        // Redis stores strings, so we must JSON.stringify objects
        await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
        console.error(`Error setting cache for key ${key}:`, error);
    }
};

// Get data from Cache
export const getCache = async (key: string) => {
    try {
        const data = await redisClient.get(key);
        if (data) {
            return JSON.parse(data); // Convert string back to Object
        }
        return null;
    } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
};

// Clear a specific cache key
export const clearCache = async (key: string) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Error deleting cache for key ${key}:`, error);
    }
};