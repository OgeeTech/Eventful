import { Response } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { sendNotification } from './notification.queue';
import { Notification } from './notification.model';
// FIX 1: Added curly braces {} because Ticket is a named export
import { Ticket } from '../tickets/ticket.model';
import { Event } from '../events/event.model';
import { User } from '../users/user.model';

// 1. Get Notifications (Hybrid: Dynamic + Database)
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        // A. Dynamic: Count Real Tickets
        const ticketCount = await Ticket.countDocuments({ user: userId });

        // B. Persistent: Fetch History from DB
        const dbNotifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        // C. Construct the Response
        const dynamicNotifs = [];

        if (ticketCount > 0) {
            dynamicNotifs.push({
                _id: 'dynamic-tickets', // Fake ID
                type: 'success',
                title: 'Upcoming Events',
                message: `You have ${ticketCount} active tickets in your wallet.`,
                isRead: false,
                createdAt: new Date()
            });
        } else {
            dynamicNotifs.push({
                _id: 'dynamic-welcome',
                type: 'info',
                title: 'Welcome to Eventful!',
                message: 'Browse events and book your first ticket now.',
                isRead: false,
                createdAt: new Date()
            });
        }

        res.json({
            notifications: [...dynamicNotifs, ...dbNotifications]
        });

    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Mark as Read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        // FIX 2: Force 'id' to be a string type
        const id = req.params.id as string;

        // Now .startsWith() will work without error
        if (id && id.startsWith('dynamic')) {
            return res.json({ success: true });
        }

        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Set Reminder
export const remindMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { eventId, timeBeforeInHours } = req.body;

        // A. Securely Fetch Event Data
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // B. Calculate Logic
        const eventDate = new Date(event.date);
        const reminderTime = new Date(eventDate.getTime() - (timeBeforeInHours * 60 * 60 * 1000));
        const now = new Date();
        const delay = reminderTime.getTime() - now.getTime();

        if (delay <= 0) {
            return res.status(400).json({ message: "It is too late to set this reminder (time has passed)." });
        }

        // C. Securely Fetch User Email
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // D. Schedule the Job
        await sendNotification('EVENT_REMINDER', {
            email: user.email,
            title: event.title,
            eventId: event._id,
            userId: userId
        }, { delay });

        console.log(`⏰ User ${user.email} set reminder for "${event.title}" at ${reminderTime.toISOString()}`);

        res.json({ message: `Success! You will be reminded on ${reminderTime.toLocaleString()}` });

    } catch (error) {
        console.error("Set Reminder Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};