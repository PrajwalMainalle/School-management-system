import mongoose from 'mongoose';
import Class from '../models/class.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';
import AcademicYear from '../models/academicYear.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// In-Memory Fallback Stores for Detached Dev Mode
const mockAcademicYears = [
  { _id: 'ay_2026_27', yearName: '2026-27', startDate: '2026-06-01', endDate: '2027-04-30', isCurrent: true, status: 'ACTIVE', schoolId: 'SCHOOL_GREENWOOD_MAIN' },
  { _id: 'ay_2025_26', yearName: '2025-26', startDate: '2025-06-01', endDate: '2026-04-30', isCurrent: false, status: 'COMPLETED', schoolId: 'SCHOOL_GREENWOOD_MAIN' },
];

const mockClasses = [
  { _id: 'cls_1', className: 'Class 1', classCode: 'CLS-01', numericLevel: 1, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'cls_5', className: 'Class 5', classCode: 'CLS-05', numericLevel: 5, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'cls_10', className: 'Class 10', classCode: 'CLS-10', numericLevel: 10, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
];

const mockSections = [
  { _id: 'sec_10a', classId: 'cls_10', sectionName: 'Section A', capacity: 40, roomNumber: 'Room 301', classTeacherId: 'usr_teacher', schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'sec_10b', classId: 'cls_10', sectionName: 'Section B', capacity: 40, roomNumber: 'Room 302', classTeacherId: null, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'sec_5a', classId: 'cls_5', sectionName: 'Section A', capacity: 35, roomNumber: 'Room 201', classTeacherId: null, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
];

const mockSubjects = [
  { _id: 'sub_math10', classId: 'cls_10', subjectName: 'Mathematics', subjectCode: 'MATH101', type: 'THEORY', maxMarks: 100, passingMarks: 35, subjectTeacherId: 'usr_teacher', schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'sub_kan10', classId: 'cls_10', subjectName: 'Kannada Language', subjectCode: 'KAN101', type: 'THEORY', maxMarks: 100, passingMarks: 35, subjectTeacherId: null, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
  { _id: 'sub_sci10', classId: 'cls_10', subjectName: 'General Science', subjectCode: 'SCI101', type: 'BOTH', maxMarks: 100, passingMarks: 35, subjectTeacherId: null, schoolId: 'SCHOOL_GREENWOOD_MAIN', branchId: 'BRANCH_MAIN_CAMPUS', isActive: true },
];

// ==========================================
// ACADEMIC YEARS
// ==========================================
export const getAcademicYears = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const years = await AcademicYear.find({ schoolId: req.user.schoolId }).sort({ startDate: -1 });
    return sendSuccess(res, 'Academic years fetched', { academicYears: years });
  }
  return sendSuccess(res, 'Academic years fetched (Dev Mode)', { academicYears: mockAcademicYears });
};

export const createAcademicYear = async (req, res) => {
  const { yearName, startDate, endDate, isCurrent } = req.body;
  if (mongoose.connection.readyState === 1) {
    if (isCurrent) {
      await AcademicYear.updateMany({ schoolId: req.user.schoolId }, { isCurrent: false });
    }
    const year = await AcademicYear.create({
      schoolId: req.user.schoolId,
      yearName,
      startDate,
      endDate,
      isCurrent: !!isCurrent,
    });
    return sendSuccess(res, 'Academic year created', { academicYear: year }, 201);
  }
  const year = { _id: 'ay_' + Date.now(), yearName, startDate, endDate, isCurrent: !!isCurrent, status: 'ACTIVE', schoolId: req.user.schoolId };
  if (isCurrent) mockAcademicYears.forEach(y => y.isCurrent = false);
  mockAcademicYears.unshift(year);
  return sendSuccess(res, 'Academic year created (Dev Mode)', { academicYear: year }, 201);
};

// ==========================================
// CLASSES
// ==========================================
export const getClasses = async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    const classes = await Class.find({ schoolId: req.user.schoolId }).sort({ numericLevel: 1 });
    return sendSuccess(res, 'Classes fetched', { classes });
  }
  return sendSuccess(res, 'Classes fetched (Dev Mode)', { classes: mockClasses });
};

export const createClass = async (req, res) => {
  const { className, classCode, numericLevel, description } = req.body;
  if (mongoose.connection.readyState === 1) {
    const cls = await Class.create({
      schoolId: req.user.schoolId,
      branchId: req.user.branchId,
      className,
      classCode,
      numericLevel: Number(numericLevel) || 1,
      description,
    });
    return sendSuccess(res, 'Class created', { class: cls }, 201);
  }
  const cls = { _id: 'cls_' + Date.now(), className, classCode, numericLevel: Number(numericLevel) || 1, description, schoolId: req.user.schoolId, branchId: req.user.branchId, isActive: true };
  mockClasses.push(cls);
  return sendSuccess(res, 'Class created (Dev Mode)', { class: cls }, 201);
};

// ==========================================
// SECTIONS
// ==========================================
export const getSections = async (req, res) => {
  const { classId } = req.query;
  if (mongoose.connection.readyState === 1) {
    const filter = { schoolId: req.user.schoolId };
    if (classId) filter.classId = classId;
    const sections = await Section.find(filter).sort({ sectionName: 1 });
    return sendSuccess(res, 'Sections fetched', { sections });
  }
  let sections = mockSections;
  if (classId) sections = sections.filter(s => s.classId === classId);
  return sendSuccess(res, 'Sections fetched (Dev Mode)', { sections });
};

export const createSection = async (req, res) => {
  const { classId, sectionName, capacity, roomNumber, classTeacherId } = req.body;
  if (mongoose.connection.readyState === 1) {
    const sec = await Section.create({
      schoolId: req.user.schoolId,
      branchId: req.user.branchId,
      classId,
      sectionName,
      capacity: Number(capacity) || 40,
      roomNumber,
      classTeacherId,
    });
    return sendSuccess(res, 'Section created', { section: sec }, 201);
  }
  const sec = { _id: 'sec_' + Date.now(), classId, sectionName, capacity: Number(capacity) || 40, roomNumber, classTeacherId, schoolId: req.user.schoolId, branchId: req.user.branchId, isActive: true };
  mockSections.push(sec);
  return sendSuccess(res, 'Section created (Dev Mode)', { section: sec }, 201);
};

// ==========================================
// SUBJECTS
// ==========================================
export const getSubjects = async (req, res) => {
  const { classId } = req.query;
  if (mongoose.connection.readyState === 1) {
    const filter = { schoolId: req.user.schoolId };
    if (classId) filter.classId = classId;
    const subjects = await Subject.find(filter).sort({ subjectName: 1 });
    return sendSuccess(res, 'Subjects fetched', { subjects });
  }
  let subjects = mockSubjects;
  if (classId) subjects = subjects.filter(s => s.classId === classId);
  return sendSuccess(res, 'Subjects fetched (Dev Mode)', { subjects });
};

export const createSubject = async (req, res) => {
  const { classId, subjectName, subjectCode, type, maxMarks, passingMarks, subjectTeacherId } = req.body;
  if (mongoose.connection.readyState === 1) {
    const sub = await Subject.create({
      schoolId: req.user.schoolId,
      branchId: req.user.branchId,
      classId,
      subjectName,
      subjectCode,
      type: type || 'THEORY',
      maxMarks: Number(maxMarks) || 100,
      passingMarks: Number(passingMarks) || 35,
      subjectTeacherId,
    });
    return sendSuccess(res, 'Subject created', { subject: sub }, 201);
  }
  const sub = { _id: 'sub_' + Date.now(), classId, subjectName, subjectCode, type: type || 'THEORY', maxMarks: Number(maxMarks) || 100, passingMarks: Number(passingMarks) || 35, subjectTeacherId, schoolId: req.user.schoolId, branchId: req.user.branchId, isActive: true };
  mockSubjects.push(sub);
  return sendSuccess(res, 'Subject created (Dev Mode)', { subject: sub }, 201);
};
