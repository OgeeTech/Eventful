import { Router } from 'express';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import { createEvent, getEvents, getMyEvents, getEventAttendees, updateEvent, deleteEvent } from './event.controller';

const router = Router();

// 1. Public Routes
router.get('/', getEvents);

// 2. Specific Static Routes (MUST BE ABOVE /:id)
router.post('/', authenticateUser, createEvent);
router.get('/my-events', authenticateUser, getMyEvents); // <--- THIS MUST BE HERE

// 3. Dynamic ID Routes (MUST BE LAST)
router.get('/:id/attendees', authenticateUser, getEventAttendees);
router.put('/:id', authenticateUser, updateEvent);
router.delete('/:id', authenticateUser, deleteEvent);

export default router;