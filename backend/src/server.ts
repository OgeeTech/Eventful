import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { errorHandler } from './common/middlewares/error.middleware'; // Import Error Handler
import { apiLimiter } from './common/middlewares/rate-limit.middleware'; // Import Rate Limiter

// Route Imports
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import paymentRoutes from './modules/payments/payment.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

import { connectRedis } from './config/redis';

import './modules/notifications/notification.worker';

dotenv.config();
connectDB();
connectRedis();

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// 2. Apply Rate Limiting to all API routes
app.use('/api', apiLimiter);

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);

// 4. Global Error Handler (MUST BE LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));