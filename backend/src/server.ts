import dotenv from 'dotenv';
// 1. Load Environment Variables FIRST
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
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

// 2. Initialize App
const app = express();

// 3. Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// 4. Swagger Documentation (Now safe because 'app' exists)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 Swagger Docs available at http://localhost:5000/api-docs");

// 5. Rate Limiting (Apply to all API routes)
app.use('/api', apiLimiter);

// 6. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 7. Global Error Handler (Must be last)
app.use(errorHandler);

// 8. Export App for Testing
export { app };

// ============================================================
// 👇 CRITICAL FIX: Only Connect to DB/Redis/Worker if NOT Testing
// ============================================================
if (process.env.NODE_ENV !== 'test') {

    // 1. Connect to Database
    connectDB();

    // 2. Connect to Redis
    connectRedis();

    // 3. Start the Background Worker
    // Using require inside the condition ensures it doesn't load during tests
    require('./modules/notifications/notification.worker');

    // 4. Start the Server Listener
    if (require.main === module) {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📄 Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
}