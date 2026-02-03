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

const app: Application = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE (MUST BE FIRST)
// ==========================================

// Parse JSON bodies (Fixes 'req.body undefined' error)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security & Logging
app.use(cors());
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


app.use('/api/events', eventRoutes);
// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'Eventful Backend is running smoothly '
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
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==========================================
// 4. ERROR HANDLER (MUST BE LAST)
// ==========================================
app.use(errorHandler);

export default app;