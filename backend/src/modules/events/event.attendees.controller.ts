import { Response } from 'express';
import { Ticket } from '../tickets/ticket.model';
import { Event } from './event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

export const getEventAttendees = async (req: AuthRequest, res: Response) => {
    try {
        const { eventId } = req.params;
        const userId = req.user?.userId || req.user?.id;

        // 1. Verify the Event belongs to this Creator
        const event = await Event.findOne({ _id: eventId, createdBy: userId });
        if (!event) {
            return res.status(404).json({ message: "Event not found or unauthorized" });
        }

        // 2. Find all tickets for this event & Populate User info
        const tickets = await Ticket.find({ eventId })
            .populate('userId', 'name email') // <--- Get Name and Email of attendee
            .select('ticketId status paymentReference userId'); // Select specific fields

        res.json({
            eventTitle: event.title,
            attendees: tickets.map(t => ({
                ticketId: t.ticketId,
                status: t.status,
                name: (t.userId as any).name,
                email: (t.userId as any).email
            }))
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};