import { Router } from 'express';
import { createEvent, getEvents } from './event.controller';
import { protect, creatorOnly } from '../../common/middlewares/auth.middleware';

const router = Router();

// Public: Everyone can see events
router.get('/', getEvents);

// Protected: Only Logged-in Creators can create events
router.post('/', protect, creatorOnly, createEvent);

export default router;