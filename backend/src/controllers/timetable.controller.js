import mongoose from 'mongoose';
import Timetable from '../models/timetable.model.js';
import Teacher from '../models/teacher.model.js';
import Class from '../models/class.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Fallback Timetable Store for Detached Dev Mode
const mockTimetableStore = [
  {
    _id: 'tt_1',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
    academicYearId: 'ay_2026_27',
    classId: 'cls_10',
    sectionId: 'sec_10a',
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '09:00',
    endTime: '09:45',
    subjectId: 'sub_math10',
    teacherId: 'tch_101',
    roomNumber: 'Room 301',
  },
  {
    _id: 'tt_2',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
    academicYearId: 'ay_2026_27',
    classId: 'cls_10',
    sectionId: 'sec_10a',
    dayOfWeek: 'MONDAY',
    periodNumber: 2,
    startTime: '09:45',
    endTime: '10:30',
    subjectId: 'sub_kan10',
    teacherId: 'tch_102',
    roomNumber: 'Room 301',
  },
];

/**
 * Pre-Save Conflict Detector Function
 */
const checkTimetableConflicts = async ({ schoolId, classId, sectionId, dayOfWeek, periodNumber, teacherId, roomNumber, excludeId = null }) => {
  if (mongoose.connection.readyState === 1) {
    // 1. Class & Section Conflict
    const classConflict = await Timetable.findOne({
      schoolId,
      classId,
      sectionId,
      dayOfWeek,
      periodNumber,
      _id: { $ne: excludeId },
    });
    if (classConflict) {
      return `Class & Section already have Period ${periodNumber} scheduled on ${dayOfWeek}`;
    }

    // 2. Teacher Conflict
    const teacherConflict = await Timetable.findOne({
      schoolId,
      teacherId,
      dayOfWeek,
      periodNumber,
      _id: { $ne: excludeId },
    });
    if (teacherConflict) {
      return `Teacher conflict: Selected teacher is already assigned to another class in Period ${periodNumber} on ${dayOfWeek}`;
    }

    // 3. Room Conflict
    if (roomNumber) {
      const roomConflict = await Timetable.findOne({
        schoolId,
        roomNumber,
        dayOfWeek,
        periodNumber,
        _id: { $ne: excludeId },
      });
      if (roomConflict) {
        return `Room conflict: ${roomNumber} is already occupied during Period ${periodNumber} on ${dayOfWeek}`;
      }
    }
  } else {
    // Dev Mode In-Memory Conflict Detection
    const classConflict = mockTimetableStore.find(
      (t) => t.classId === classId && t.sectionId === sectionId && t.dayOfWeek === dayOfWeek && t.periodNumber === Number(periodNumber) && t._id !== excludeId
    );
    if (classConflict) {
      return `Class & Section already have Period ${periodNumber} scheduled on ${dayOfWeek}`;
    }

    const teacherConflict = mockTimetableStore.find(
      (t) => t.teacherId === teacherId && t.dayOfWeek === dayOfWeek && t.periodNumber === Number(periodNumber) && t._id !== excludeId
    );
    if (teacherConflict) {
      return `Teacher conflict: Selected teacher is already teaching another class in Period ${periodNumber} on ${dayOfWeek}`;
    }

    if (roomNumber) {
      const roomConflict = mockTimetableStore.find(
        (t) => t.roomNumber === roomNumber && t.dayOfWeek === dayOfWeek && t.periodNumber === Number(periodNumber) && t._id !== excludeId
      );
      if (roomConflict) {
        return `Room conflict: ${roomNumber} is already occupied in Period ${periodNumber} on ${dayOfWeek}`;
      }
    }
  }

  return null; // No conflicts!
};

/**
 * Get Class Timetable
 */
export const getClassTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId, dayOfWeek } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

      const schedule = await Timetable.find(filter).sort({ periodNumber: 1 });
      return sendSuccess(res, 'Timetable schedule fetched', { timetable: schedule });
    } else {
      let filtered = [...mockTimetableStore];
      if (classId) filtered = filtered.filter((t) => t.classId === classId);
      if (sectionId) filtered = filtered.filter((t) => t.sectionId === sectionId);
      if (dayOfWeek) filtered = filtered.filter((t) => t.dayOfWeek === dayOfWeek);
      return sendSuccess(res, 'Timetable schedule fetched (Dev Mode)', { timetable: filtered });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Create Timetable Period Slot (WITH MANDATORY PRE-SAVE CONFLICT VALIDATION)
 */
export const createPeriod = async (req, res, next) => {
  try {
    const { classId, sectionId, dayOfWeek, periodNumber, startTime, endTime, subjectId, teacherId, roomNumber } = req.body;

    if (!classId || !sectionId || !dayOfWeek || !periodNumber || !startTime || !endTime || !subjectId || !teacherId) {
      return sendError(res, 'All period slot details including class, day, period #, subject, and teacher are required', null, 400);
    }

    // STRICT PRE-SAVE CONFLICT VALIDATION
    const conflictMessage = await checkTimetableConflicts({
      schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
      classId,
      sectionId,
      dayOfWeek,
      periodNumber: Number(periodNumber),
      teacherId,
      roomNumber,
    });

    if (conflictMessage) {
      return sendError(res, conflictMessage, null, 409); // 409 Conflict Code
    }

    if (mongoose.connection.readyState === 1) {
      const period = await Timetable.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        academicYearId: 'ay_2026_27',
        classId,
        sectionId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        startTime,
        endTime,
        subjectId,
        teacherId,
        roomNumber,
      });
      return sendSuccess(res, 'Period scheduled successfully', { period }, 201);
    } else {
      const period = {
        _id: 'tt_' + Date.now(),
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
        academicYearId: 'ay_2026_27',
        classId,
        sectionId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        startTime,
        endTime,
        subjectId,
        teacherId,
        roomNumber,
      };
      mockTimetableStore.push(period);
      return sendSuccess(res, 'Period scheduled successfully (Dev Mode)', { period }, 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Period Slot
 */
export const deletePeriod = async (req, res, next) => {
  try {
    const periodId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      await Timetable.findByIdAndDelete(periodId);
      return sendSuccess(res, 'Period deleted successfully');
    } else {
      const idx = mockTimetableStore.findIndex((t) => t._id === periodId);
      if (idx >= 0) mockTimetableStore.splice(idx, 1);
      return sendSuccess(res, 'Period deleted (Dev Mode)');
    }
  } catch (error) {
    next(error);
  }
};
