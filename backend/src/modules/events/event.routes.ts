import { Router } from 'express';
import { createEvent, getEvents } from './event.controller';
// UPDATE: Changed 'protect' to 'authenticateUser'
import { authenticateUser, creatorOnly } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public: Get all events
router.get('/', getEvents);

// Protected: Create Event (Only logged-in Creators)
// UPDATE: Using 'authenticateUser' here
router.post('/', authenticateUser, creatorOnly, createEvent);

export default router;