import Event from '../models/event.model.js';
import Notice from '../models/notice.model.js';
import Notification from '../models/notification.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get School Calendar Events
 */
export const getEvents = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const { month, year, eventType } = req.query;

    const filter = { schoolId };
    if (eventType) filter.eventType = eventType;

    let events = await Event.find(filter).sort({ startDate: 1 });

    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      events = events.filter((e) => e.startDate.startsWith(prefix));
    }

    return sendSuccess(res, 'Calendar events fetched successfully', events);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Calendar Event
 */
export const addEvent = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';
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
  } catch (err) {
    next(err);
  }
};

/**
 * Get Notices & Circulars
 */
export const getNotices = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const userRole = req.user?.role || 'STUDENT';

    const notices = await Notice.find({ schoolId }).sort({ publishDate: -1 });

    const filtered = notices.filter((n) => {
      if (n.audienceType === 'EVERYONE') return true;
      if (n.audienceType === 'TEACHERS' && userRole === 'TEACHER') return true;
      if (n.audienceType === 'STAFF' && (userRole === 'NON_TEACHING_STAFF' || userRole === 'STAFF')) return true;
      if (n.audienceType === 'STUDENTS' && userRole === 'STUDENT') return true;
      if (['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(userRole)) return true;
      return false;
    });

    return sendSuccess(res, 'Notices fetched successfully', filtered);
  } catch (err) {
    next(err);
  }
};

/**
 * Create Notice / Announcement
 */
export const addNotice = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';
    const { title, content, priority, audienceType, targetClassId, targetSectionId, publishDate, expiryDate, attachments } = req.body;

    if (!title || !content) {
      return sendError(res, 'Notice title and content are required', null, 400);
    }

    const pubDate = publishDate || new Date().toISOString().split('T')[0];

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
  } catch (err) {
    next(err);
  }
};

/**
 * Track Notice Read
 */
export const markNoticeRead = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user?._id;

    const notice = await Notice.findById(noticeId);
    if (!notice) return sendError(res, 'Notice not found', null, 404);

    const alreadyRead = notice.readBy.some((r) => String(r.userId) === String(userId));
    if (!alreadyRead) {
      notice.readBy.push({ userId, readAt: new Date() });
      await notice.save();
    }
    return sendSuccess(res, 'Notice marked as read', notice);
  } catch (err) {
    next(err);
  }
};

/**
 * Get User Notifications Center
 */
export const getNotifications = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const userId = req.user?._id;
    const userRole = req.user?.role || 'STUDENT';

    const notifications = await Notification.find({
      schoolId,
      $or: [{ userId }, { userId: 'ALL' }, { role: userRole }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return sendSuccess(res, 'Notifications fetched successfully', { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark Single Notification as Read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notif = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return sendSuccess(res, 'Notification marked as read', notif);
  } catch (err) {
    next(err);
  }
};

/**
 * Mark All Notifications as Read
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const userId = req.user?._id;

    await Notification.updateMany(
      { schoolId, $or: [{ userId }, { userId: 'ALL' }], isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return sendSuccess(res, 'All notifications marked as read', null);
  } catch (err) {
    next(err);
  }
};
