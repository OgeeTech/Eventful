import { Router } from 'express';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import {
    createEvent,
    getEvents,
    getMyEvents,
    getEventAttendees,
    updateEvent,
    deleteEvent,
} from './event.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Event management
 */

// 1. Public Routes

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all public events
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', getEvents);

// 2. Create Event

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Creator only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - price
 *               - location
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateUser, createEvent);

// 3. My Events

/**
 * @swagger
 * /events/my-events:
 *   get:
 *     summary: Get events created by the logged-in user
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events
 *       401:
 *         description: Unauthorized
 */
router.get('/my-events', authenticateUser, getMyEvents);

// 4. Event Attendees

/**
 * @swagger
 * /events/{id}/attendees:
 *   get:
 *     summary: Get attendees for a specific event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: List of attendees
 *       403:
 *         description: Forbidden (Not the event owner)
 *       404:
 *         description: Event not found
 */
router.get('/:id/attendees', authenticateUser, getEventAttendees);

// 5. Update Event

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an existing event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.put('/:id', authenticateUser, updateEvent);

// 6. Delete Event

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.delete('/:id', authenticateUser, deleteEvent);

export default router;
