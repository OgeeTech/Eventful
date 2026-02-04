import { Request, Response } from 'express';
import { Event } from './event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { getCache, setCache, clearCache } from '../../common/cache/redis.cache';
import { sendNotification } from '../../modules/notifications/notification.queue';
import { User } from '../users/user.model';

// Key used to store events in Redis
const EVENTS_CACHE_KEY = 'all_events';

// 1. Create Event (And Clear Cache + Send Notification)
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ message: "User not identified" });

        const { title, description, date, location, price, capacity } = req.body;

        const event = await Event.create({
            title, description, date, location, price, capacity,
            createdBy: userId
        });

        // A. Clear the Redis Cache
        await clearCache(EVENTS_CACHE_KEY);
        console.log("🧹 Cache Cleared");

        // B. Send Notification (Background Job) - MISSING PART ADDED HERE
        const user = await User.findById(userId);
        if (user) {
            await sendNotification('EVENT_CREATED', {
                email: user.email,
                title: event.title,
                eventId: event._id
            });
            console.log("📨 Notification Job Added to Queue");
        }

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get Events (With Redis Caching)
export const getEvents = async (req: Request, res: Response) => {
    try {
        // A. Try to get from Redis first
        const cachedEvents = await getCache(EVENTS_CACHE_KEY);

        if (cachedEvents) {
            console.log("⚡ Serving Events from Redis Cache");
            return res.json({ events: cachedEvents });
        }

        // B. If not in Redis, get from MongoDB
        console.log("🐢 Serving Events from MongoDB (Database)");
        const events = await Event.find().sort({ date: 1 });

        // C. Save to Redis for next time (Expires in 1 hour)
        await setCache(EVENTS_CACHE_KEY, events, 3600);

        res.json({ events });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};