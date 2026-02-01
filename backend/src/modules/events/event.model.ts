import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true }, // 0 for free events
    capacity: { type: Number, required: true }
}, { timestamps: true });

export const Event = mongoose.model('Event', eventSchema);