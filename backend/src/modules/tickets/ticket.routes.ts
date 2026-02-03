import { Router } from 'express';
import { validateTicket } from './ticket.controller';

const router = Router();

// Endpoint: POST /api/tickets/validate
router.post('/validate', validateTicket);

export default router;