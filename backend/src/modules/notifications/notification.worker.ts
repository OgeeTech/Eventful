import { Worker } from 'bullmq';
import { logger } from '../../common/utils/logger';

// 1. Define the Worker
const worker = new Worker('email-queue', async (job) => {
    // This is where the heavy lifting happens
    console.log(`Processing Job ${job.id} of type ${job.name}...`);

    if (job.name === 'EVENT_CREATED') {
        // SIMULATE SENDING AN EMAIL (Wait 1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`📧 EMAIL SENT: "Hello ${job.data.email}, you successfully created the event: ${job.data.title}"`);
    }

}, {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

// 2. Event Listeners (Optional debug)
worker.on('completed', (job) => {
    logger.info(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} has failed with ${err.message}`);
});

export default worker;