import Timetable from '../models/timetable.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Pre-Save Conflict Detector Function
 */
const checkTimetableConflicts = async ({ schoolId, classId, sectionId, dayOfWeek, periodNumber, teacherId, roomNumber, excludeId = null }) => {
  // 1. Class & Section Conflict
  const classConflict = await Timetable.findOne({
    schoolId,
    classId,
    sectionId,
    dayOfWeek,
    periodNumber,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
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
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
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
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (roomConflict) {
      return `Room conflict: ${roomNumber} is already occupied during Period ${periodNumber} on ${dayOfWeek}`;
    }
  }

  return null;
};

/**
 * Get Class Timetable
 */
export const getClassTimetable = async (req, res, next) => {
  try {
    const { classId, sectionId, dayOfWeek } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId };

    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    const schedule = await Timetable.find(filter).sort({ periodNumber: 1 });
    return sendSuccess(res, 'Timetable schedule fetched', { timetable: schedule });
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

    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    // STRICT PRE-SAVE CONFLICT VALIDATION
    const conflictMessage = await checkTimetableConflicts({
      schoolId,
      classId,
      sectionId,
      dayOfWeek,
      periodNumber: Number(periodNumber),
      teacherId,
      roomNumber,
    });

    if (conflictMessage) {
      return sendError(res, conflictMessage, null, 409);
    }

    const period = await Timetable.create({
      schoolId,
      branchId,
      academicYearId: 'AY_2026_27',
      classId,
      sectionId,
      dayOfWeek,
      periodNumber: Number(periodNumber),
      startTime,
      endTime,
      subjectId,
      teacherId,
      roomNumber: roomNumber || '',
    });

    return sendSuccess(res, 'Period scheduled successfully', { period }, 201);
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
    await Timetable.findByIdAndDelete(periodId);
    return sendSuccess(res, 'Period deleted successfully');
  } catch (error) {
    next(error);
  }
};
