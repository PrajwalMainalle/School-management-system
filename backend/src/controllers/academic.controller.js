import Class from '../models/class.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';
import AcademicYear from '../models/academicYear.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ==========================================
// ACADEMIC YEARS
// ==========================================
export const getAcademicYears = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const years = await AcademicYear.find({ schoolId }).sort({ startDate: -1 });
    return sendSuccess(res, 'Academic years fetched', { academicYears: years });
  } catch (error) {
    next(error);
  }
};

export const createAcademicYear = async (req, res, next) => {
  try {
    const { yearName, startDate, endDate, isCurrent } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';

    if (!yearName || !startDate || !endDate) {
      return sendError(res, 'Year name, start date, and end date are required', null, 400);
    }

    if (isCurrent) {
      await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
    }

    const year = await AcademicYear.create({
      schoolId,
      yearName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isCurrent: !!isCurrent,
    });

    return sendSuccess(res, 'Academic year created', { academicYear: year }, 201);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CLASSES
// ==========================================
export const getClasses = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const classes = await Class.find({ schoolId }).sort({ numericLevel: 1 });
    return sendSuccess(res, 'Classes fetched', { classes });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { className, classCode, numericLevel, description } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    if (!className || !classCode) {
      return sendError(res, 'Class name and class code are required', null, 400);
    }

    const cls = await Class.create({
      schoolId,
      branchId,
      className,
      classCode,
      numericLevel: Number(numericLevel) || 1,
      description: description || '',
    });

    return sendSuccess(res, 'Class created', { class: cls }, 201);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SECTIONS
// ==========================================
export const getSections = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId };
    if (classId) filter.classId = classId;

    const sections = await Section.find(filter).sort({ sectionName: 1 });
    return sendSuccess(res, 'Sections fetched', { sections });
  } catch (error) {
    next(error);
  }
};

export const createSection = async (req, res, next) => {
  try {
    const { classId, sectionName, capacity, roomNumber, classTeacherId } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    if (!classId || !sectionName) {
      return sendError(res, 'Class ID and section name are required', null, 400);
    }

    const sec = await Section.create({
      schoolId,
      branchId,
      classId,
      sectionName,
      capacity: Number(capacity) || 40,
      roomNumber: roomNumber || '',
      classTeacherId: classTeacherId || null,
    });

    return sendSuccess(res, 'Section created', { section: sec }, 201);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SUBJECTS
// ==========================================
export const getSubjects = async (req, res, next) => {
  try {
    const { classId } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId };
    if (classId) filter.classId = classId;

    const subjects = await Subject.find(filter).sort({ subjectName: 1 });
    return sendSuccess(res, 'Subjects fetched', { subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { classId, subjectName, subjectCode, type, maxMarks, passingMarks, subjectTeacherId } = req.body;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    if (!classId || !subjectName || !subjectCode) {
      return sendError(res, 'Class ID, subject name, and subject code are required', null, 400);
    }

    const sub = await Subject.create({
      schoolId,
      branchId,
      classId,
      subjectName,
      subjectCode,
      type: type || 'THEORY',
      maxMarks: Number(maxMarks) || 100,
      passingMarks: Number(passingMarks) || 35,
      subjectTeacherId: subjectTeacherId || null,
    });

    return sendSuccess(res, 'Subject created', { subject: sub }, 201);
  } catch (error) {
    next(error);
  }
};
