import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './common/middlewares/error.middleware'; // <--- Import
import { apiLimiter } from './common/middlewares/rate-limit.middleware'; // <--- Import

const app: Application = express();

// 1. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Apply Rate Limiting to all API routes
app.use('/api', apiLimiter); // <--- Apply here

// 2. Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// 3. API Routes (Placeholder)
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'success',
        message: 'Eventful Backend is running smoothly 🚀'
    });
});

// 4. Fallback for 404s (Frontend)
app.use((req: Request, res: Response, next: Function) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 5. Global Error Handler (MUST be last)
app.use(errorHandler); // <--- Register here

export default app;