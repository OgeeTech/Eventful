import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { errorHandler } from './common/middlewares/error.middleware';
import { apiLimiter } from './common/middlewares/rate-limit.middleware';
import { logger } from './common/utils/logger';

// Route Imports
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import paymentRoutes from './modules/payments/payment.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notification.routes';

import { connectRedis } from './config/redis';

// NOTE: We removed the static import of the worker here
// import './modules/notifications/notification.worker'; 

dotenv.config();

const app = express();

// 1. Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// 2. Rate Limiting
app.use('/api', apiLimiter);

// 3. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 4. Global Error Handler
app.use(errorHandler);

// 5. Export App for Testing
export { app };

// ============================================================
// 👇 CRITICAL FIX: Only Connect to DB/Redis/Worker if NOT Testing
// ============================================================
if (process.env.NODE_ENV !== 'test') {

    // 1. Connect to Database
    connectDB();

    // 2. Connect to Redis
    connectRedis();

    // 3. Start the Background Worker (Using require so it doesn't load during tests)
    require('./modules/notifications/notification.worker');

    // 4. Start the Server Listener
    if (require.main === module) {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    }
}