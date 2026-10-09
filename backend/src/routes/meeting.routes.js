import express from 'express';
import {
  getMeetings,
  createMeeting,
  joinMeeting,
  startMeeting,
  endMeeting,
  sendChatMessage,
  saveMeetingNotes,
} from '../controllers/meeting.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.get('/meetings/join/:roomCode', joinMeeting);
router.put('/meetings/:meetingId/start', startMeeting);
router.put('/meetings/:meetingId/end', endMeeting);
router.post('/meetings/:meetingId/chat', sendChatMessage);
router.put('/meetings/:meetingId/notes', saveMeetingNotes);

export default router;
