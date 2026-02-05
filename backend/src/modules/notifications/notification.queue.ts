import { Queue } from 'bullmq';
import { logger } from '../../common/utils/logger';

// 1. Create a new Queue named 'email-queue'
export const emailQueue = new Queue('email-queue', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

// 2. Helper function to add a job 
// FIX: Added 'opts' (optional) as the 3rd argument to fix the error
export const sendNotification = async (type: string, data: any, opts?: any) => {
    try {
        await emailQueue.add(type, data, opts); // <--- Pass options (like delay) to BullMQ
        logger.info(`Job added to queue: ${type}`);
    } catch (error) {
        logger.error('Failed to add job to queue', error);
    }
};