import { Router } from 'express';
// FIX: Added 'getMyEvents' to the import list below
import { createEvent, getEvents, getMyEvents } from './event.controller';
import { authenticateUser, creatorOnly } from '../../common/middlewares/auth.middleware';
import { getEventAttendees } from './event.attendees.controller';

const router = Router();

// Public: Get all events
router.get('/', getEvents);

// Protected: Get ONLY my events (Must come before /:id routes)
router.get('/my-events', authenticateUser, creatorOnly, getMyEvents);

// Protected: Create Event (Only logged-in Creators)
router.post('/', authenticateUser, creatorOnly, createEvent);

// Protected: View Attendees for a specific event
router.get('/:eventId/attendees', authenticateUser, creatorOnly, getEventAttendees);

export default router;