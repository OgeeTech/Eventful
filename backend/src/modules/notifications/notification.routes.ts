import { Router } from 'express';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import { getNotifications, markAsRead, remindMe } from './notification.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Manage user notifications and event reminders
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       type:
 *                         type: string
 *                         enum: [info, success, warning, error]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/', authenticateUser, getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', authenticateUser, markAsRead);

/**
 * @swagger
 * /notifications/remind:
 *   post:
 *     summary: Set a reminder for an event
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - timeBeforeInHours
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: The ID of the event to remind about
 *               timeBeforeInHours:
 *                 type: number
 *                 description: Hours before event to send reminder (e.g., 1, 24, 48)
 *     responses:
 *       200:
 *         description: Reminder set successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Event not found
 */
router.post('/remind', authenticateUser, remindMe);

export default router;
