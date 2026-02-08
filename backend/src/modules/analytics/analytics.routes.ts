import { Router } from 'express';
import { getCreatorAnalytics } from './analytics.controller';
import { authenticateUser, creatorOnly } from '../../common/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Creator dashboard statistics and reports
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get analytics for the creator dashboard
 *     description: Returns total revenue, tickets sold, tickets scanned, and total events count for the logged-in creator.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue generated
 *                   example: 50000
 *                 ticketsSold:
 *                   type: number
 *                   description: Total number of tickets sold across all events
 *                   example: 120
 *                 ticketsScanned:
 *                   type: number
 *                   description: Total number of attendees checked in
 *                   example: 85
 *                 eventsCount:
 *                   type: number
 *                   description: Number of events created
 *                   example: 5
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (User is not a creator)
 */
router.get('/dashboard', authenticateUser, creatorOnly, getCreatorAnalytics);

export default router;
