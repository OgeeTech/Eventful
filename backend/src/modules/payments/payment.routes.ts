import { Router } from 'express';
import { initializePayment, verifyAndIssueTicket } from './payment.controller';
import { authenticateUser } from '../../common/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment initialization and verification
 */

/**
 * @swagger
 * /payments/initialize:
 *   post:
 *     summary: Initialize a Paystack payment
 *     tags: [Payments]
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
 *               - amount
 *               - email
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event being paid for
 *               amount:
 *                 type: number
 *                 description: Amount to be paid in Naira
 *                 example: 5000
 *               email:
 *                 type: string
 *                 description: User email for Paystack
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/initialize', authenticateUser, initializePayment);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify a Paystack payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *             properties:
 *               reference:
 *                 type: string
 *                 description: Paystack payment reference
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Transaction not found
 */
router.post('/verify', authenticateUser, verifyAndIssueTicket);

export default router;
