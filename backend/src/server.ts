import dotenv from 'dotenv';
// 1. Load Environment Variables FIRST
dotenv.config();

// 👇 DEBUG LOG: Check if Mongo URI is found
console.log("🔍 DEBUG: Mongo URI is:", process.env.MONGO_URI ? "Found ✅" : "Missing ❌");

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/db';
// ✅ RE-ENABLED REDIS IMPORT
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
// ✅ RESTORED PROPER CORS FOR YOUR HOSTED FRONTEND
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://iventfuul.netlify.app" // 👈 YOUR NETLIFY FRONTEND
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// app.use(express.static('../frontend')); // Optional: Depends on how you host frontend

// 4. Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📄 Swagger Docs available at /api-docs");

// 5. Rate Limiting
app.use('/api', apiLimiter);

// 6. Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 7. Global Error Handler
app.use(errorHandler);

// 8. Export App for Testing
export { app };

// ============================================================
// 👇 LIVE CONNECTIONS (DB + REDIS)
// ============================================================
if (process.env.NODE_ENV !== 'test') {

    // 1. Connect to Database
    connectDB();

    // 2. Connect to Redis (✅ RE-ENABLED)
    connectRedis();

    // 3. Start the Background Worker (✅ RE-ENABLED)
    require('./modules/notifications/notification.worker');

    // 4. Start the Server Listener
    if (require.main === module) {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📄 Documentation available at /api-docs`);
        });
    }
}