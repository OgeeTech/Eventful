import { Queue } from 'bullmq';
import { logger } from '../../common/utils/logger';

// 1. Create a new Queue named 'email-queue'
// We connect it to the same Redis server you just set up
export const emailQueue = new Queue('email-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

// 2. Helper function to add a job
export const sendNotification = async (type: string, data: any) => {
    try {
        await emailQueue.add(type, data);
        logger.info(`Job added to queue: ${type}`);
    } catch (error) {
        logger.error('Failed to add job to queue', error);
    }
};