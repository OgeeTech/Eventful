import { Router } from 'express';
import { getCreatorAnalytics } from './analytics.controller';
import { authenticateUser, creatorOnly } from '../../common/middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/analytics/dashboard
router.get('/dashboard', authenticateUser, creatorOnly, getCreatorAnalytics);

export default router;