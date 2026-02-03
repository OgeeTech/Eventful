import { Router } from 'express';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
// FIXED: Changed 'initPayment' to 'initializePayment'
import { initializePayment, verifyAndIssueTicket } from './payment.controller';

const router = Router();

// 1. Initialize Payment (User clicks "Buy Ticket")
router.post('/initialize', authenticateUser, initializePayment);

// 2. Verify Payment (Paystack calls this back or Frontend calls it)
router.post('/verify', authenticateUser, verifyAndIssueTicket);

export default router;