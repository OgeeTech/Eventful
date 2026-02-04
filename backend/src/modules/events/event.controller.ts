import { Request, Response } from 'express';
import { Event } from './event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

// Create a new event
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        // ROBUST ID CHECK: Get the ID from any possible field in the token
        const userId = req.user?.userId || req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User not identified" });
        }

        console.log("Creating Event for Creator:", userId); // Debug Log

        const { title, description, date, location, price, capacity } = req.body;

        // CREATE EVENT WITH "createdBy" FIELD
        const event = await Event.create({
            title,
            description,
            date,
            location,
            price,
            capacity,
            createdBy: userId // <--- THIS IS THE CRITICAL LINE
        });

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// ... keep your getEvents function below ...
export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json({ events }); // Changed to object wrapper for consistency
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};