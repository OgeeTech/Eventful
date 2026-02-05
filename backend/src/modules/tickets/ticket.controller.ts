import { Request, Response } from 'express';
import { Ticket } from './ticket.model';
import { Event } from '../events/event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware'; // <--- Added this import!
import QRCode from 'qrcode';

// 1. Buy Ticket
export const buyTicket = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { eventId, paymentReference } = req.body;

        // Verify Event
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Create Ticket
        const ticket = await Ticket.create({
            eventId,
            userId,
            paymentReference,
            status: 'valid'
        });

        // Generate QR Code
        const qrCodeUrl = await QRCode.toDataURL(ticket.ticketId);

        res.status(201).json({ 
            message: "Ticket purchased successfully", 
            ticket,
            qrCodeUrl 
        });

    } catch (error) {
        console.error("Buy Ticket Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Validate Ticket (Scanner)
export const validateTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.body;

        // Find Ticket & Populate User Details
        const ticket = await Ticket.findOne({ ticketId }).populate('userId', 'name email');

        if (!ticket) {
            return res.status(404).json({ valid: false, message: "❌ Invalid Ticket" });
        }

        // Check Status
        if (ticket.status === 'used') {
            return res.status(400).json({ valid: false, message: "⚠️ Ticket already used" });
        }

        // Mark as used
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

// 3. Get My Tickets (Attendee History)
export const getMyTickets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;

        // Find tickets and populate Event details
        const tickets = await Ticket.find({ userId })
            .populate('eventId') // <--- Fills in Title, Date, Location
            .sort({ createdAt: -1 });

        res.json({ tickets });
    } catch (error) {
        console.error("Get Tickets Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};