import { Router } from 'express';
import { buyTicket, validateTicket, getMyTickets } from './ticket.controller';
import { authenticateUser } from '../../common/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket purchase, validation, and retrieval
 */

/**
 * @swagger
 * /tickets/buy:
 *   post:
 *     summary: Buy a ticket for an event
 *     tags: [Tickets]
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
 *               - paymentReference
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: The MongoDB ID of the event
 *               paymentReference:
 *                 type: string
 *                 description: The Paystack payment reference
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 *       400:
 *         description: Missing fields or payment failed
 *       404:
 *         description: Event not found
 */
router.post('/buy', authenticateUser, buyTicket);

/**
 * @swagger
 * /tickets/validate:
 *   post:
 *     summary: Validate a ticket (Scanner)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: string
 *                 description: The 8-digit Ticket ID (e.g. "69874800")
 *                 example: "69874800"
 *     responses:
 *       200:
 *         description: Valid ticket - Access Granted
 *       400:
 *         description: Invalid Ticket ID format
 *       404:
 *         description: Ticket not found
 */
router.post('/validate', authenticateUser, validateTicket);

/**
 * @swagger
 * /tickets/my-tickets:
 *   get:
 *     summary: Get all tickets purchased by the logged-in user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ticketId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       event:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           date:
 *                             type: string
 */
router.get('/my-tickets', authenticateUser, getMyTickets);

export default router;
