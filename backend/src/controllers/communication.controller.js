import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import Notice from '../models/notice.model.js';
import Notification from '../models/notification.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Dev Mode Stores
let mockEvents = [];
let mockNotices = [];
let mockNotifications = [];

/**
 * Get School Calendar Events
 */
export const getEvents = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { month, year, eventType } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId };
      if (eventType) filter.eventType = eventType;

      let events = await Event.find(filter).sort({ startDate: 1 });

      if (month && year) {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        events = events.filter((e) => e.startDate.startsWith(prefix));
      }

      return sendSuccess(res, 'Calendar events fetched successfully', events);
    }

    let events = [...mockEvents];
    if (eventType) events = events.filter((e) => e.eventType === eventType);
    return sendSuccess(res, 'Calendar events fetched (Dev Mode)', events);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Calendar Event
 */
export const addEvent = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      organizer,
      audienceType,
      targetClassId,
      targetSectionId,
      priority,
    } = req.body;

    if (!title || !startDate || !endDate) {
      return sendError(res, 'Event title, start date, and end date are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const eventDoc = await Event.create({
        schoolId,
        branchId,
        title: title.trim(),
        description: description || '',
        eventType: eventType || 'PROGRAM',
        startDate,
        endDate,
        startTime: startTime || '09:00',
        endTime: endTime || '17:00',
        location: location || 'School Campus',
        organizer: organizer || req.user?.name || 'School Management',
        audienceType: audienceType || 'EVERYONE',
        targetClassId: targetClassId || null,
        targetSectionId: targetSectionId || null,
        priority: priority || 'MEDIUM',
        status: 'SCHEDULED',
      });

      // Broadcast Notification to Audience
      await Notification.create({
        schoolId,
        branchId,
        userId: 'ALL',
        role: audienceType === 'EVERYONE' ? 'ALL' : audienceType,
        category: 'EVENTS',
        title: `New Event: ${title}`,
        message: `Event "${title}" scheduled on ${startDate}. Location: ${location || 'Campus'}`,
        link: '/calendar',
      });

      return sendSuccess(res, 'Event created successfully', eventDoc, 201);
    } else {
      const eventDoc = {
        _id: 'evt_' + Date.now(),
        schoolId,
        branchId,
        title,
        eventType: eventType || 'PROGRAM',
        startDate,
        endDate,
        status: 'SCHEDULED',
      };
      mockEvents.push(eventDoc);
      return sendSuccess(res, 'Event created (Dev Mode)', eventDoc, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Notices & Circulars
 */
export const getNotices = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const userRole = req.user?.role || 'STUDENT';

    if (mongoose.connection.readyState === 1) {
      const notices = await Notice.find({ schoolId }).sort({ publishDate: -1 });

      // Filter audience
      const filtered = notices.filter((n) => {
        if (n.audienceType === 'EVERYONE') return true;
        if (n.audienceType === 'TEACHERS' && userRole === 'TEACHER') return true;
        if (n.audienceType === 'STAFF' && (userRole === 'NON_TEACHING_STAFF' || userRole === 'STAFF')) return true;
        if (n.audienceType === 'STUDENTS' && userRole === 'STUDENT') return true;
        if (['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(userRole)) return true;
        return false;
      });

      return sendSuccess(res, 'Notices fetched successfully', filtered);
    }

    return sendSuccess(res, 'Notices fetched (Dev Mode)', mockNotices);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Create Notice / Announcement
 */
export const addNotice = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const branchId = req.user?.branchId || 'GLOBAL';
    const { title, content, priority, audienceType, targetClassId, targetSectionId, publishDate, expiryDate, attachments } = req.body;

    if (!title || !content) {
      return sendError(res, 'Notice title and content are required', null, 400);
    }

    const pubDate = publishDate || new Date().toISOString().split('T')[0];

    if (mongoose.connection.readyState === 1) {
      const noticeDoc = await Notice.create({
        schoolId,
        branchId,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'NORMAL',
        audienceType: audienceType || 'EVERYONE',
        targetClassId: targetClassId || null,
        targetSectionId: targetSectionId || null,
        publishDate: pubDate,
        expiryDate: expiryDate || '',
        authorName: req.user?.name || 'School Principal',
        attachments: attachments || [],
      });

      // Notify Audience
      await Notification.create({
        schoolId,
        branchId,
        userId: 'ALL',
        role: audienceType === 'EVERYONE' ? 'ALL' : audienceType,
        category: 'NOTICES',
        title: `Circular: ${title}`,
        message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        link: '/notices',
      });

      return sendSuccess(res, 'Notice published successfully', noticeDoc, 201);
    } else {
      const noticeDoc = {
        _id: 'ntc_' + Date.now(),
        schoolId,
        branchId,
        title,
        content,
        publishDate: pubDate,
        priority: priority || 'NORMAL',
      };
      mockNotices.push(noticeDoc);
      return sendSuccess(res, 'Notice published (Dev Mode)', noticeDoc, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Track Notice Read
 */
export const markNoticeRead = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1) {
      const notice = await Notice.findById(noticeId);
      if (!notice) return sendError(res, 'Notice not found', null, 404);

      const alreadyRead = notice.readBy.some((r) => r.userId === userId);
      if (!alreadyRead) {
        notice.readBy.push({ userId, readAt: new Date() });
        await notice.save();
      }
      return sendSuccess(res, 'Notice marked as read', notice);
    }
    return sendSuccess(res, 'Notice marked as read (Dev Mode)', { noticeId });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get User Notifications Center
 */
export const getNotifications = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const userId = req.user?._id || 'usr_organizer';
    const userRole = req.user?.role || 'STUDENT';

    if (mongoose.connection.readyState === 1) {
      const notifications = await Notification.find({
        schoolId,
        $or: [{ userId }, { userId: 'ALL' }, { role: userRole }],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return sendSuccess(res, 'Notifications fetched successfully', { notifications, unreadCount });
    }

    return sendSuccess(res, 'Notifications fetched (Dev Mode)', {
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
    });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Mark Single Notification as Read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (mongoose.connection.readyState === 1) {
      const notif = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      return sendSuccess(res, 'Notification marked as read', notif);
    }
    return sendSuccess(res, 'Notification marked as read (Dev Mode)', { notificationId });
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Mark All Notifications as Read
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany(
        { schoolId, $or: [{ userId }, { userId: 'ALL' }], isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return sendSuccess(res, 'All notifications marked as read', null);
    }

    mockNotifications.forEach((n) => (n.isRead = true));
    return sendSuccess(res, 'All notifications marked as read (Dev Mode)', null);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};
