import { Router } from 'express';
// FIX: Change 'protect' to 'authenticateUser' to match your actual middleware file
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import { getNotifications, markAsRead, remindMe } from './notification.controller';

const router = Router();

// 1. Get all notifications
router.get('/', authenticateUser, getNotifications);

// 2. Mark a specific notification as read
router.put('/:id/read', authenticateUser, markAsRead);

// 3. Set a specific reminder
router.post('/remind', authenticateUser, remindMe);

export default router;