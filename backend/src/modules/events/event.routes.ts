import { Router } from 'express';
import { createEvent, getEvents } from './event.controller';
// UPDATE: Changed 'protect' to 'authenticateUser'
import { authenticateUser, creatorOnly } from '../../common/middlewares/auth.middleware';
import { getEventAttendees } from './event.attendees.controller';

const router = Router();

// Public: Get all events
router.get('/', getEvents);

// Protected: Create Event (Only logged-in Creators)
// UPDATE: Using 'authenticateUser' here
router.post('/', authenticateUser, creatorOnly, createEvent);
router.get('/:eventId/attendees', authenticateUser, creatorOnly, getEventAttendees);
export default router;