import { Request, Response } from 'express';
import { Ticket } from './ticket.model';
import { Event } from '../events/event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import QRCode from 'qrcode';
import mongoose from 'mongoose';

// 1. Buy Ticket
export const buyTicket = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;
        const { eventId, paymentReference } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // Create Ticket
        const ticket = await Ticket.create({
            eventId,
            userId,
            paymentReference,
            status: 'valid',
            isScanned: false
        });
        console.log("🎟️ NEW TICKET CREATED!");
        console.log("ID:", ticket._id);
        console.log("Short Code:", ticket.ticketId)
        // FIX: Force the ID to be a string to prevent TypeScript errors
        // We cast 'ticket' to 'any' because Typescript might not see 'ticketId' immediately
        const ticketAny = ticket as any;
        const idToEncode = String(ticketAny.ticketId || ticketAny._id);

        // Generate QR Code
        const qrCodeUrl = await QRCode.toDataURL(idToEncode);

        // Save QR to DB
        ticket.qrCode = qrCodeUrl;
        await ticket.save();

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

// 2. Validate Ticket (Scanner Logic)
export const validateTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.body; // e.g., "69874800"

        if (!ticketId) {
            return res.status(400).json({ valid: false, message: "No Ticket ID provided" });
        }

        const cleanId = ticketId.replace('#', '').trim();

        // Find by custom 'ticketId' field
        const ticket = await Ticket.findOne({ ticketId: cleanId }).populate('userId', 'name email');

        if (!ticket) {
            return res.status(404).json({ valid: false, message: "❌ Ticket ID Not Found" });
        }

        if (ticket.isScanned || ticket.status === 'used') {
            return res.json({
                valid: false,
                message: "⚠️ ALREADY USED",
                attendee: ticket.userId
            });
        }

        // Mark as used
        ticket.status = 'used';
        ticket.isScanned = true;
        await ticket.save();

        res.json({
            valid: true,
            message: "✅ Access Granted",
            attendee: ticket.userId
        });

    } catch (error) {
        console.error("Validation Error:", error);
        res.status(500).json({ valid: false, message: "Server Error" });
    }
};

// 3. Get My Tickets
export const getMyTickets = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user as any;
        const userId = user?.id || user?._id || user?.userId;

        const tickets = await Ticket.find({ userId }).populate('eventId').sort({ createdAt: -1 });
        res.json({ tickets });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};