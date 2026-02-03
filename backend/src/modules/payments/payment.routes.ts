import { Router } from 'express';
import { initPayment, verifyAndIssueTicket } from './payment.controller';
import { protect } from '../../common/middlewares/auth.middleware';

const router = Router();

// Only logged-in users can pay
router.post('/initialize', protect, initPayment);
router.post('/verify', protect, verifyAndIssueTicket);

export default router;