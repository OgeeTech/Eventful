import { User } from '../users/user.model';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { Event } from '../events/event.model';
import { Ticket } from '../tickets/ticket.model';
import mongoose from 'mongoose';
import { initializePayment as initPaystack, verifyPayment } from '../../config/paystack';
import { generateQRCode } from '../../common/utils/qrcode';

// 1. Initialize Payment
export const initializePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        console.log("--- Payment Init Started ---");

        const { eventId } = req.body;

        // ROBUST ID CHECK: Check all possible places for the ID
        const userId = req.user?.userId || req.user?.id || req.user?._id;

        console.log("Debug - User ID from Token:", userId);
        console.log("Debug - Event ID from Body:", eventId);

        if (!userId) {
            return res.status(401).json({ message: "User ID missing from token." });
        }

        // A. Find the User (This defines the 'user' variable!)
        const user = await User.findById(userId);
        if (!user) {
            console.error("❌ Database Error: User not found for ID:", userId);
            return res.status(404).json({ message: 'User account not found.' });
        }

        // B. Find the Event
        const event = await Event.findById(eventId);
        if (!event) {
            console.error("❌ Database Error: Event not found for ID:", eventId);
            return res.status(404).json({ message: 'Event not found.' });
        }

        // C. Define Callback URL
        const myCallbackUrl = "http://127.0.0.1:5000/success.html";

        // D. Initialize Paystack
        // Now 'user' is definitely defined, so user.email works
        const paymentData = await initPaystack(user.email, event.price, myCallbackUrl);

        res.json({
            message: 'Payment initialized',
            url: paymentData.authorization_url,
            reference: paymentData.reference
        });

    } catch (error: any) {
        console.error("CRITICAL ERROR in Payment Controller:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// 2. Verify Payment & Issue Ticket
// 2. Verify Payment & Issue Ticket
export const verifyAndIssueTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reference, eventId } = req.body;
        // Fix for User ID extraction
        const userId = req.user?.userId || req.user?.id || req.user?._id;

        console.log("Verifying reference:", reference); // Debug Log

        // A. Verify with Paystack
        const paystackData = await verifyPayment(reference);

        console.log("Paystack Status:", paystackData.status); // Debug Log

        // FIX: Paystack returns 'success' (string), not true (boolean) inside the data object
        if (paystackData.status !== 'success') {
            return res.status(400).json({ message: 'Payment failed or invalid status: ' + paystackData.status });
        }

        // B. Check if ticket already exists
        const existingTicket = await Ticket.findOne({ paymentReference: reference });
        if (existingTicket) {
            return res.status(200).json({ message: 'Ticket already issued', ticket: existingTicket });
        }

        // ... (Rest of the code remains the same: Generate ID, QR, Save Ticket) ...

        // C. Generate Unique Ticket ID
        const uniqueTicketId = new mongoose.Types.ObjectId().toString();

        // D. Generate QR Code
        const qrData = JSON.stringify({
            ticketId: uniqueTicketId,
            userId: userId,
            eventId: eventId
        });
        const qrCodeImage = await generateQRCode(qrData);

        // E. Save Ticket to DB
        const ticket = await Ticket.create({
            eventId,
            userId,
            ticketId: uniqueTicketId,
            qrCode: qrCodeImage,
            paymentReference: reference,
            status: 'valid'
        });

        res.status(201).json({
            message: 'Payment successful, Ticket issued!',
            ticket
        });

    } catch (error) {
        console.error("Verification Error:", error);
        next(error);
    }
};