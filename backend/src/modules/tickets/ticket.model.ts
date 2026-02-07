import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Custom Short ID (e.g., "69874800")
    ticketId: { type: String, unique: true },

    qrCode: { type: String },
    paymentReference: { type: String, required: true },
    isScanned: { type: Boolean, default: false },
    status: { type: String, enum: ['valid', 'used', 'cancelled'], default: 'valid' }
}, { timestamps: true });

// --- AUTO-GENERATION LOGIC (FIXED) ---
// 1. We removed 'next' from the arguments
// 2. We use 'async function()' so Mongoose waits automatically
ticketSchema.pre('save', async function () {
    if (!this.ticketId) {
        // Generate a random 8-digit number (e.g., 69874800)
        let uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Check uniqueness safely
        // (We cast constructor to 'any' to let us search the DB from inside the document)
        const Model = this.constructor as any;
        const exists = await Model.findOne({ ticketId: uniqueId });

        if (exists) {
            uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
        }

        this.ticketId = uniqueId;
    }
});

export const Ticket = mongoose.model('Ticket', ticketSchema);