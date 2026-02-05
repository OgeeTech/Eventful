import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // UI Helpers (Added these so your frontend icons/colors work)
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    title: { type: String, required: true },

    message: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model('Notification', notificationSchema);