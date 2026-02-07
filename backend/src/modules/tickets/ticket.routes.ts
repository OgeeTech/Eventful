import { Router } from 'express';
// FIX: Changed 'verifyTicket' to 'validateTicket' to match the controller
import { buyTicket, validateTicket, getMyTickets } from './ticket.controller';
import { authenticateUser } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post('/buy', authenticateUser, buyTicket);

// FIX: Update the function usage here too
router.post('/validate', authenticateUser, validateTicket);

// New Route: GET /api/tickets/my-tickets
router.get('/my-tickets', authenticateUser, getMyTickets);

export default router;