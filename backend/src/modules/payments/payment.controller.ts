import { User } from '../users/user.model';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { Event } from '../events/event.model';
import { Ticket } from '../tickets/ticket.model';
import mongoose from 'mongoose';
import { initializePayment as initPaystack, verifyPayment } from '../../config/paystack';
import QRCode from 'qrcode';

// 1. Initialize Payment
export const initializePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        console.log("--- Payment Init Started ---");

        const { eventId } = req.body;
        const userId = req.user?.userId || req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User ID missing from token." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User account not found.' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Dynamic Callback URL
        const host = req.get('host');
        const protocol = req.protocol;
        const myCallbackUrl = `${protocol}://${host}/success.html`;

        console.log("Redirecting user back to:", myCallbackUrl);

        // Initialize Paystack
        const paymentData = await initPaystack(user.email, event.price, myCallbackUrl);

        res.json({
            message: 'Payment initialized',
            url: paymentData.authorization_url,
            reference: paymentData.reference
        });

    } catch (error: any) {
        console.error("Payment Init Error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// 2. Verify Payment & Issue Ticket
export const verifyAndIssueTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reference, eventId } = req.body;
        const userId = req.user?.userId || req.user?.id || req.user?._id;

        console.log("Verifying reference:", reference);

        // A. Verify with Paystack
        const paystackData = await verifyPayment(reference);

        if (paystackData.status !== 'success') {
            return res.status(400).json({ message: 'Payment failed or invalid status' });
        }

        // B. Check if ticket exists
        const existingTicket = await Ticket.findOne({ paymentReference: reference });
        if (existingTicket) {
            return res.status(200).json({ message: 'Ticket already issued', ticket: existingTicket });
        }

        // C. Create Ticket (DB generates the 8-digit ID automatically)
        const ticket = await Ticket.create({
            eventId,
            userId,
            paymentReference: reference,
            status: 'valid',
            isScanned: false
        });

        // D. Generate QR Code
        // FIX: Force conversion to String to satisfy TypeScript
        // Use 'ticketId' if available, otherwise fallback to internal '_id'
        const ticketAny = ticket as any; // Cast to any to safely access properties
        const idToEncode = String(ticketAny.ticketId || ticketAny._id);

        const qrCodeImage = await QRCode.toDataURL(idToEncode);

        // E. Save QR to Ticket
        ticket.qrCode = qrCodeImage;
        await ticket.save();

        console.log(`✅ Ticket Created: ${idToEncode} for User: ${userId}`);

        res.status(201).json({
            message: 'Payment successful, Ticket issued!',
            ticket
        });

    } catch (error) {
        console.error("Verification Error:", error);
        next(error);
    }
};