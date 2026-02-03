import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: String, required: true, unique: true }, // Unique Ticket Reference
    qrCode: { type: String, required: true }, // The Base64 Image string
    paymentReference: { type: String, required: true }, // Paystack Ref
    isScanned: { type: Boolean, default: false }, // Has user entered the event?
    status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' }
}, { timestamps: true });

export const Ticket = mongoose.model('Ticket', ticketSchema);