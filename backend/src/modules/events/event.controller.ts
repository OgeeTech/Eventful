import { Response, NextFunction } from 'express';
import { Event } from './event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

// Create a new Event
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, description, date, location, price, capacity } = req.body;

        const event = await Event.create({
            creatorId: req.user.id, // Comes from the token!
            title,
            description,
            date,
            location,
            price,
            capacity
        });

        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        next(error);
    }
};

// Get All Events
export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
        res.json(events);
    } catch (error) {
        next(error);
    }
};