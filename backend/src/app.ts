import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './common/middlewares/error.middleware';
import { apiLimiter } from './common/middlewares/rate-limit.middleware';
import authRoutes from './modules/auth/auth.routes';
import eventRoutes from './modules/events/event.routes';
import paymentRoutes from './modules/payments/payment.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app: Application = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE (MUST BE FIRST)
// ==========================================

// Parse JSON bodies (Fixes 'req.body undefined' error)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👇 CRITICAL FIX: Updated CORS for Netlify
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",      // Local Testing
        "http://localhost:5500",      // Local Testing
        "https://iventfuul.netlify.app" // 👈 YOUR LIVE FRONTEND
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', apiLimiter);

// ==========================================
// 2. API ROUTES (MUST BE AFTER MIDDLEWARE)
// ==========================================

// Auth Routes
app.use('/api/auth', authRoutes);

// Payment Routes
app.use('/api/payments', paymentRoutes);

// Ticket Scan Routes
app.use('/api/tickets', ticketRoutes);

// Analytics & Event Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/events', eventRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'Eventful Backend is running smoothly 🚀'
    });
});

// ==========================================
// 3. FRONTEND SERVING & FALLBACKS
// ==========================================

const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Fallback Handler
app.use((req: Request, res: Response, next: Function) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
    }
    // For any other route, send the frontend (if hosted on same server)
    // Since you are using Netlify, this part is mostly fallback for local testing
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==========================================
// 4. ERROR HANDLER (MUST BE LAST)
// ==========================================
app.use(errorHandler);

export default app;