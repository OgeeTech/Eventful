import { Request, Response } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { Event } from './event.model';
import { Ticket } from '../tickets/ticket.model';
import { redisClient } from '../../config/redis';

// 1. Create Event
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, date, location, price, capacity } = req.body;

        // ROBUST ID EXTRACTION
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;

        if (!userId) {
            console.error("Create Event Failed: User ID missing", req.user);
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const event = await Event.create({
            title, description, date, location, price, capacity,
            createdBy: userId
        });

        // --- CACHE CLEAR ---
        // Clear the feed so the new event appears immediately
        await redisClient.del('events_feed');

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Events (Public Feed with Caching)
// 2. Get All Events (FIXED: Now counts 'sold' tickets + Caching)
export const getEvents = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'events_feed';

        // Step A: Check Redis Cache
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
        } catch (err) {
            console.error("Redis Get Error:", err);
        }

        // Step B: Query MongoDB (Using .lean() for performance)
        const events = await Event.find().sort({ date: 1 }).populate('createdBy', 'name email').lean();

        // Step C: Count Tickets for every event (The missing piece!)
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const soldCount = await Ticket.countDocuments({ eventId: event._id });
            return {
                ...event,
                sold: soldCount // This calculates the progress bar
            };
        }));

        // Step D: Save to Redis (60s TTL)
        try {
            await redisClient.setEx(cacheKey, 60, JSON.stringify({ events: eventsWithStats }));
        } catch (err) {
            console.error("Redis Set Error:", err);
        }

        res.json({ events: eventsWithStats });
    } catch (error) {
        console.error("Get Events Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get My Events (Creator Dashboard)
export const getMyEvents = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // 1. Get events
        const events = await Event.find({ createdBy: userId }).sort({ date: 1 }).lean();

        // 2. Count sold tickets
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const soldCount = await Ticket.countDocuments({ eventId: event._id });
            return { ...event, sold: soldCount };
        }));

        res.json({ events: eventsWithStats });
    } catch (error) {
        console.error("Get My Events Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. Get Event Attendees
export const getEventAttendees = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user as any;
        const currentUserId = user?.id || user?._id || user?.userId;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Robust Ownership Check
        let creatorId = (event as any).createdBy;
        if (typeof creatorId === 'object' && creatorId !== null) {
            creatorId = creatorId._id || creatorId.id;
        }

        if (String(creatorId) !== String(currentUserId)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const tickets = await Ticket.find({ eventId: id }).populate('userId', 'name email');

        const attendees = tickets.map((t: any) => ({
            name: t.userId ? t.userId.name : 'Unknown',
            email: t.userId ? t.userId.email : 'Unknown',
            ticketId: t.ticketId,
            status: t.status
        }));

        res.json({ eventTitle: event.title, attendees });
    } catch (error) {
        console.error("Get Attendees Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Update Event
export const updateEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId || req.user?.id;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if ((event as any).createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });

        // --- CACHE CLEAR ---
        await redisClient.del('events_feed');

        res.json(updatedEvent);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 6. Delete Event
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId || req.user?.id;

        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if ((event as any).createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await event.deleteOne();

        // --- CACHE CLEAR ---
        await redisClient.del('events_feed');

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};