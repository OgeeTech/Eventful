import mongoose from 'mongoose';
import { logger } from '../common/utils/logger';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};