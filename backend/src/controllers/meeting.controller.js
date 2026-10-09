import mongoose from 'mongoose';
import crypto from 'crypto';
import Meeting from '../models/meeting.model.js';
import Notification from '../models/notification.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

let mockMeetings = [];

/**
 * Generate Secure WebRTC Room Token
 */
const generateSecureRoomToken = (roomCode, userId, role) => {
  const payload = {
    roomCode,
    userId,
    role,
    issuedAt: Date.now(),
  };
  const secret = process.env.JWT_SECRET || 'webrtc_secure_room_key_2025';
  const token = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return `rtc_tok_${token.substring(0, 32)}`;
};

/**
 * Get Meetings List
 */
export const getMeetings = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const userRole = req.user?.role || 'STUDENT';
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1) {
      const meetings = await Meeting.find({ schoolId }).sort({ scheduledDate: -1, scheduledTime: -1 });

      const filtered = meetings.filter((m) => {
        if (m.organizerId === userId) return true;
        if (['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(userRole)) return true;
        if (m.meetingType === 'ALL_SCHOOL') return true;
        if (m.meetingType === 'TEACHERS' && userRole === 'TEACHER') return true;
        if (m.meetingType === 'STAFF' && (userRole === 'NON_TEACHING_STAFF' || userRole === 'STAFF')) return true;
        if (m.meetingType === 'STUDENTS' && userRole === 'STUDENT') return true;
        if (m.meetingType === 'CLASS' || m.meetingType === 'SECTION') return true;
        return true;
      });

      return sendSuccess(res, 'Meetings fetched successfully', filtered);
    }

    return sendSuccess(res, 'Meetings fetched (Dev Mode)', mockMeetings);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Create / Schedule Meeting or Online Class
 */
export const createMeeting = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const {
      title,
      description,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      meetingType,
      targetClassId,
      targetSectionId,
      subjectId,
    } = req.body;

    if (!title || !scheduledDate || !scheduledTime) {
      return sendError(res, 'Title, scheduled date, and time are required', null, 400);
    }

    const roomCode = `ROOM-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const roomToken = generateSecureRoomToken(roomCode, req.user?._id || 'host_1', req.user?.role || 'TEACHER');

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.create({
        schoolId,
        branchId,
        title: title.trim(),
        description: description || '',
        organizerId: req.user?._id || 'usr_teacher',
        organizerName: req.user?.name || 'Faculty Instructor',
        organizerRole: req.user?.role || 'TEACHER',
        scheduledDate,
        scheduledTime,
        durationMinutes: Number(durationMinutes || 45),
        meetingType: meetingType || 'CLASS',
        targetClassId: targetClassId || null,
        targetSectionId: targetSectionId || null,
        subjectId: subjectId || null,
        roomCode,
        roomToken,
        status: 'SCHEDULED',
      });

      // Broadcast Notification
      await Notification.create({
        schoolId,
        branchId,
        userId: 'ALL',
        role: meetingType === 'ALL_SCHOOL' ? 'ALL' : meetingType,
        category: 'MEETINGS',
        title: `Online Meeting: ${title}`,
        message: `Scheduled on ${scheduledDate} at ${scheduledTime}. Join room code: ${roomCode}`,
        link: '/meetings',
      });

      return sendSuccess(res, 'Meeting scheduled successfully', meeting, 201);
    } else {
      const meeting = {
        _id: 'mtg_' + Date.now(),
        schoolId,
        title,
        scheduledDate,
        scheduledTime,
        roomCode,
        roomToken,
        status: 'SCHEDULED',
      };
      mockMeetings.push(meeting);
      return sendSuccess(res, 'Meeting scheduled (Dev Mode)', meeting, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Join Meeting & Get WebRTC Token
 */
export const joinMeeting = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user?._id || 'user_guest';
    const userName = req.user?.name || 'Guest User';
    const role = req.user?.role || 'STUDENT';

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.findOne({ roomCode });
      if (!meeting) return sendError(res, 'Meeting room not found', null, 404);

      if (meeting.isLocked && meeting.organizerId !== userId && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return sendError(res, 'Meeting room is locked by the host', null, 403);
      }

      if (meeting.status === 'ENDED') {
        return sendError(res, 'Meeting has already ended', null, 400);
      }

      // Add participant log if not already in live list
      const existing = meeting.participants.find((p) => p.userId === userId && !p.leftAt);
      if (!existing) {
        meeting.participants.push({ userId, userName, role, joinedAt: new Date() });
        await meeting.save();
      }

      const joinToken = generateSecureRoomToken(roomCode, userId, role);

      return sendSuccess(res, 'Joined meeting room successfully', {
        meeting,
        joinToken,
        isHost: meeting.organizerId === userId || ['SUPER_ADMIN', 'ADMIN'].includes(role),
      });
    }

    const meeting = mockMeetings.find((m) => m.roomCode === roomCode);
    if (!meeting) return sendError(res, 'Meeting room not found', null, 404);

    return sendSuccess(res, 'Joined meeting room (Dev Mode)', {
      meeting,
      joinToken: generateSecureRoomToken(roomCode, userId, role),
      isHost: true,
    });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Start Meeting (Host Action)
 */
export const startMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) return sendError(res, 'Meeting not found', null, 404);

      meeting.status = 'LIVE';
      meeting.startedAt = new Date();
      await meeting.save();

      return sendSuccess(res, 'Meeting is now LIVE', meeting);
    }

    const meeting = mockMeetings.find((m) => m._id === meetingId);
    if (meeting) meeting.status = 'LIVE';
    return sendSuccess(res, 'Meeting is now LIVE (Dev Mode)', meeting);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * End Meeting (Host Action)
 */
export const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) return sendError(res, 'Meeting not found', null, 404);

      meeting.status = 'ENDED';
      meeting.endedAt = new Date();
      await meeting.save();

      return sendSuccess(res, 'Meeting ended successfully', meeting);
    }

    const meeting = mockMeetings.find((m) => m._id === meetingId);
    if (meeting) meeting.status = 'ENDED';
    return sendSuccess(res, 'Meeting ended (Dev Mode)', meeting);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Send In-Meeting Chat Message
 */
export const sendChatMessage = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { message } = req.body;

    if (!message) return sendError(res, 'Message text is required', null, 400);

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) return sendError(res, 'Meeting not found', null, 404);

      const msgObj = {
        senderId: req.user?._id || 'usr_1',
        senderName: req.user?.name || 'Participant',
        message: message.trim(),
        timestamp: new Date(),
      };

      meeting.chatMessages.push(msgObj);
      await meeting.save();

      return sendSuccess(res, 'Chat message sent', msgObj, 201);
    }

    return sendSuccess(res, 'Chat message sent (Dev Mode)', { message }, 201);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Save Meeting Notes & Action Items
 */
export const saveMeetingNotes = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { notes, decisions, actionItems } = req.body;

    if (mongoose.connection.readyState === 1) {
      const meeting = await Meeting.findById(meetingId);
      if (!meeting) return sendError(res, 'Meeting not found', null, 404);

      if (notes !== undefined) meeting.notes = notes;
      if (decisions) meeting.decisions = decisions;
      if (actionItems) meeting.actionItems = actionItems;

      await meeting.save();
      return sendSuccess(res, 'Meeting notes updated successfully', meeting);
    }

    return sendSuccess(res, 'Meeting notes updated (Dev Mode)', { notes, decisions, actionItems });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};
