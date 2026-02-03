import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // We will hash this later
    role: {
        type: String,
        enum: ['attendee', 'creator'],
        default: 'attendee'
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);