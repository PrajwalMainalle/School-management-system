import Attendance from '../models/attendance.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const markBatchAttendance = async (req, res, next) => {
  try {
    const { userType, classId, sectionId, date, attendanceRecords } = req.body;

    if (!userType || !date || !Array.isArray(attendanceRecords)) {
      return sendError(res, 'UserType, date, and attendanceRecords are required', null, 400);
    }

    const targetDate = new Date(date);
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    const operations = attendanceRecords.map((rec) => ({
      updateOne: {
        filter: { schoolId, entityId: rec.entityId, date: targetDate },
        update: {
          $set: {
            schoolId,
            branchId,
            userType,
            entityId: rec.entityId,
            classId: classId || '',
            sectionId: sectionId || '',
            date: targetDate,
            status: rec.status,
            remarks: rec.remarks || '',
            recordedBy: req.user?._id,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    return sendSuccess(res, 'Batch attendance recorded successfully');
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date, userType } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId, userType: userType || 'STUDENT' };

    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const logs = await Attendance.find(filter);
    return sendSuccess(res, 'Attendance logs fetched', { attendanceLogs: logs });
  } catch (error) {
    next(error);
  }
};
