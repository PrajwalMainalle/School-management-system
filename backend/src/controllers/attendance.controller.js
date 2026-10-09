import mongoose from 'mongoose';
import Attendance from '../models/attendance.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockAttendanceStore = [
  { _id: 'att_1', userType: 'STUDENT', entityId: 'stu_1001', classId: 'cls_10', sectionId: 'sec_10a', date: new Date().toISOString().split('T')[0], status: 'PRESENT', schoolId: 'SCHOOL_GREENWOOD_MAIN' },
  { _id: 'att_2', userType: 'STUDENT', entityId: 'stu_1002', classId: 'cls_10', sectionId: 'sec_10a', date: new Date().toISOString().split('T')[0], status: 'PRESENT', schoolId: 'SCHOOL_GREENWOOD_MAIN' },
  { _id: 'att_3', userType: 'STUDENT', entityId: 'stu_1003', classId: 'cls_5', sectionId: 'sec_5a', date: new Date().toISOString().split('T')[0], status: 'ABSENT', schoolId: 'SCHOOL_GREENWOOD_MAIN' },
];

export const markBatchAttendance = async (req, res, next) => {
  try {
    const { userType, classId, sectionId, date, attendanceRecords } = req.body;
    // attendanceRecords = [{ entityId: 'stu_1001', status: 'PRESENT' }, ...]

    if (!userType || !date || !Array.isArray(attendanceRecords)) {
      return sendError(res, 'UserType, date, and attendanceRecords are required', null, 400);
    }

    const targetDate = new Date(date);

    if (mongoose.connection.readyState === 1) {
      const operations = attendanceRecords.map((rec) => ({
        updateOne: {
          filter: { schoolId: req.user.schoolId, entityId: rec.entityId, date: targetDate },
          update: {
            $set: {
              schoolId: req.user.schoolId,
              branchId: req.user.branchId,
              userType,
              entityId: rec.entityId,
              classId,
              sectionId,
              date: targetDate,
              status: rec.status,
              remarks: rec.remarks || '',
              recordedBy: req.user._id,
            },
          },
          upsert: true,
        },
      }));

      await Attendance.bulkWrite(operations);
      return sendSuccess(res, 'Batch attendance recorded successfully');
    } else {
      attendanceRecords.forEach((rec) => {
        const idx = mockAttendanceStore.findIndex(
          (a) => a.entityId === rec.entityId && a.date === date
        );
        if (idx >= 0) {
          mockAttendanceStore[idx].status = rec.status;
        } else {
          mockAttendanceStore.push({
            _id: 'att_' + Date.now() + Math.random(),
            userType,
            entityId: rec.entityId,
            classId,
            sectionId,
            date,
            status: rec.status,
            schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
          });
        }
      });
      return sendSuccess(res, 'Batch attendance recorded successfully (Dev Mode)');
    }
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId, sectionId, date } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId, userType: 'STUDENT' };
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (date) filter.date = new Date(date);

      const logs = await Attendance.find(filter);
      return sendSuccess(res, 'Attendance logs fetched', { attendanceLogs: logs });
    } else {
      let filtered = mockAttendanceStore.filter((a) => a.userType === 'STUDENT');
      if (classId) filtered = filtered.filter((a) => a.classId === classId);
      if (sectionId) filtered = filtered.filter((a) => a.sectionId === sectionId);
      return sendSuccess(res, 'Attendance logs fetched (Dev Mode)', { attendanceLogs: filtered });
    }
  } catch (error) {
    next(error);
  }
};
