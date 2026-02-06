import { Request, Response } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { Event } from './event.model';
// FIX 1: Add curly braces { } because Ticket is a named export
import { Ticket } from '../tickets/ticket.model';

// 1. Create Event
// 1. Create Event (FIXED)
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, date, location, price, capacity } = req.body;

        // ROBUST ID EXTRACTION
        // Check all possible locations where the ID might be stored by the middleware
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;

        if (!userId) {
            console.error("Create Event Failed: User ID missing from request object", req.user);
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            price,
            capacity,
            createdBy: userId
        });

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Events
export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find().sort({ date: 1 }).populate('createdBy', 'name email');
        res.json({ events });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get My Events (FIXED: Robust User ID Check)
export const getMyEvents = async (req: AuthRequest, res: Response) => {
    try {
        // ROBUST ID EXTRACTION (Matches your Create Event fix)
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }
        
        console.log(`🔍 Fetching events for Creator: ${userId}`); // Debug Log

        // 1. Get all events created by this user
        const events = await Event.find({ createdBy: userId }).sort({ date: 1 }).lean();

        // 2. Count real tickets for each event
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const soldCount = await Ticket.countDocuments({ eventId: event._id });
            return {
                ...event,
                sold: soldCount
            };
        }));

        console.log(`✅ Found ${eventsWithStats.length} events.`); // Debug Log
        res.json({ events: eventsWithStats });
    } catch (error) {
        console.error("Get My Events Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// 4. Get Event attendee
export const getEventAttendees = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // 1. ROBUST USER ID EXTRACTION
        const user = req.user as any;
        const currentUserId = user?.id || user?._id || user?.userId;

        const event = await Event.findById(id);

        if (!event) return res.status(404).json({ message: "Event not found" });

        // 2. ROBUST OWNERSHIP CHECK
        // Handle if 'createdBy' is an object (populated) or a string (ID)
        let creatorId = (event as any).createdBy;
        if (typeof creatorId === 'object' && creatorId !== null) {
            creatorId = creatorId._id || creatorId.id;
        }

        // Convert both to strings for safe comparison
        if (String(creatorId) !== String(currentUserId)) {
            console.log(`⛔ Unauthorized Access: Creator ${creatorId} !== User ${currentUserId}`);
            return res.status(403).json({ message: "Unauthorized: You are not the creator of this event." });
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
            return res.status(403).json({ message: 'Not authorized to edit this event' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
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
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};