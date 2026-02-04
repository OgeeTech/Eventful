import { Request, Response } from 'express';
import { Ticket } from './ticket.model';

// Validate Ticket Endpoint
export const validateTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.body;

        // 1. Find Ticket & Populate User Details (so we see WHO owns it)
        const ticket = await Ticket.findOne({ ticketId }).populate('userId', 'name email');

        if (!ticket) {
            return res.status(404).json({ valid: false, message: "❌ Invalid Ticket" });
        }

        // 2. Check Status
        if (ticket.status === 'used') {
            return res.status(400).json({ valid: false, message: "⚠️ Ticket already used" });
        }

        //  Mark as used so it can't be used twice
        ticket.status = 'used';
        await ticket.save();

        res.json({
            valid: true,
            message: "✅ Access Granted",
            attendee: ticket.userId
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};