import { Response } from 'express';
import { Ticket } from '../tickets/ticket.model';
import { Event } from '../events/event.model';
import { AuthRequest } from '../../common/middlewares/auth.middleware';
import mongoose from 'mongoose';

export const getCreatorAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        console.log(`🔍 ANALYTICS REQUEST - Creator ID: ${userId}`);

        // 1. Find all events created by this user
        const events = await Event.find({ createdBy: userId });
        const eventIds = events.map(e => e._id);

        console.log(`📅 Found ${events.length} events for this creator.`);
        console.log(`🆔 Event IDs:`, eventIds);

        if (eventIds.length === 0) {
            console.log("⚠️ No events found for this user. Returning zeros.");
            return res.json({ totalRevenue: 0, ticketsSold: 0, eventsCount: 0 });
        }

        // 2. Aggregate Tickets
        const stats = await Ticket.aggregate([
            {
                $match: {
                    eventId: { $in: eventIds },
                    status: 'valid'
                }
            },
            {
                $lookup: {
                    from: 'events',
                    localField: 'eventId',
                    foreignField: '_id',
                    as: 'eventDetails'
                }
            },
            { $unwind: '$eventDetails' },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$eventDetails.price' },
                    ticketsSold: { $sum: 1 }
                }
            }
        ]);

        console.log("📊 Aggregation Result:", stats);

        const result = stats.length > 0 ? stats[0] : { totalRevenue: 0, ticketsSold: 0 };

        res.json({
            totalRevenue: result.totalRevenue,
            ticketsSold: result.ticketsSold,
            eventsCount: eventIds.length
        });

    } catch (error) {
        console.error("❌ Analytics Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};