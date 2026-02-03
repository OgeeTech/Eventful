import { User } from '../users/user.model';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import { Event } from '../events/event.model';
import { Ticket } from '../tickets/ticket.model'; // Added this import
import mongoose from 'mongoose'; // Added this import
import { initializePayment as initPaystack, verifyPayment } from '../../config/paystack'; // Added verifyPayment import
import { generateQRCode } from '../../common/utils/qrcode'; // Added this import

// 1. Initialize Payment
export const initializePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { eventId } = req.body;
        const userId = req.user?.userId;

        // 1. Get Data
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // 2. Define the Callback URL specifically for THIS app
        const myCallbackUrl = "http://127.0.0.1:5000/success.html";

        // 3. Send it to the config function
        const paymentData = await initPaystack(user.email, event.price, myCallbackUrl);

        res.json({
            message: 'Payment initialized',
            url: paymentData.authorization_url,
            reference: paymentData.reference
        });

    } catch (error: any) {
        console.error("Paystack Error:", error.response?.data || error.message);
        next(error);
    }
};

// 2. Verify Payment & Issue Ticket (YOU WERE MISSING THIS PART)
export const verifyAndIssueTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reference, eventId } = req.body;
        const userId = req.user?.userId || req.user?.id;

        // A. Verify with Paystack
        const paystackData = await verifyPayment(reference);

        if (paystackData.status !== true && paystackData.data?.status !== 'success') {
            return res.status(400).json({ message: 'Payment failed or invalid' });
        }

        // B. Check if ticket already exists
        const existingTicket = await Ticket.findOne({ paymentReference: reference });
        if (existingTicket) {
            return res.status(200).json({ message: 'Ticket already issued', ticket: existingTicket });
        }

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
        next(error);
    }
};