import express from 'express';
import {
  getEvents,
  addEvent,
  getNotices,
  addNotice,
  markNoticeRead,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/communication.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Calendar Events
router.get('/events', getEvents);
router.post('/events', addEvent);

// Notices & Circulars
router.get('/notices', getNotices);
router.post('/notices', addNotice);
router.put('/notices/:noticeId/read', markNoticeRead);

// Notifications Center
router.get('/notifications', getNotifications);
router.put('/notifications/:notificationId/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
