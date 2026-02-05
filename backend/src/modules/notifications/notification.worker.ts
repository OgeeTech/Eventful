import { Worker } from 'bullmq';
import { Notification } from './notification.model';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load env vars (Ensure .env is loaded so process.env works)
dotenv.config();

// 1. Configure the Email Transporter (SECURE)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER, // <--- Reads safely from .env
        pass: process.env.MAIL_PASS  // <--- Reads safely from .env
    }
});

const worker = new Worker('email-queue', async (job) => {
    console.log(`Processing Job ${job.id}: ${job.name}`);

    // 2. Determine Message Content
    let subject = "";
    let message = "";

    if (job.name === 'EVENT_CREATED') {
        subject = "Event Created Successfully!";
        message = `Hello! You successfully created the event: <b>${job.data.title}</b>`;
    } else if (job.name === 'EVENT_REMINDER') {
        subject = "🔔 Event Reminder";
        message = `Reminder: Your event "<b>${job.data.title}</b>" is starting tomorrow!`;
    }

    // 3. SEND THE REAL EMAIL
    try {
        const info = await transporter.sendMail({
            from: `"Eventful App" <${process.env.MAIL_USER}>`, // Sender address
            to: job.data.email, // Receiver address
            subject: subject,
            html: `<p>${message}</p>` // HTML body
        });

        console.log(`✅ REAL EMAIL SENT: ${info.messageId}`);
    } catch (err) {
        console.error("❌ Failed to send email:", err);
    }

    // 4. Save In-App Notification (Database)
    if (job.data.userId) {
        // Strip HTML tags for the clean database message
        const cleanMessage = message.replace(/<[^>]*>?/gm, '');

        await Notification.create({
            userId: job.data.userId,
            message: cleanMessage,
            eventId: job.data.eventId
        });
        console.log("🔔 In-App Notification Saved to DB");
    }

}, {
    connection: { host: 'localhost', port: 6379 }
});

export default worker;