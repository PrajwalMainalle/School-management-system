import mongoose from 'mongoose';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Mock In-Memory Store for Detached Dev Mode
const mockStudents = [
  {
    _id: 'stu_1001',
    studentId: 'STU2026001',
    admissionNumber: 'ADM-2026-001',
    firstName: 'Rohan',
    lastName: 'Patil',
    dateOfBirth: '2011-05-15',
    gender: 'MALE',
    phone: '+91 98765 11111',
    email: 'student@greenwood.edu',
    address: { street: '45 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    emergencyContact: { guardianName: 'Suresh Patil', relationship: 'Father', phone: '+91 98765 11111' },
    classId: 'cls_10',
    sectionId: 'sec_10a',
    academicYearId: 'ay_2026_27',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    documents: [{ name: 'Birth Certificate.pdf', url: '#' }, { name: 'Transfer Certificate.pdf', url: '#' }],
    previousSchoolDetails: { schoolName: 'St. Joseph High School', lastGrade: 'Grade 9', tcNumber: 'TC-9988' },
    academicHistory: [{ academicYear: '2025-26', className: 'Class 9', sectionName: 'Section A', gradePercentage: 88, promotedDate: '2026-04-15' }],
    userId: 'usr_student',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'stu_1002',
    studentId: 'STU2026002',
    admissionNumber: 'ADM-2026-002',
    firstName: 'Ananya',
    lastName: 'Rao',
    dateOfBirth: '2012-08-20',
    gender: 'FEMALE',
    phone: '+91 98765 22222',
    email: 'ananya.rao@greenwood.edu',
    address: { street: '12 Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
    emergencyContact: { guardianName: 'Prakash Rao', relationship: 'Father', phone: '+91 98765 22222' },
    classId: 'cls_10',
    sectionId: 'sec_10a',
    academicYearId: 'ay_2026_27',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    documents: [{ name: 'Aadhar Card.pdf', url: '#' }],
    previousSchoolDetails: { schoolName: 'National Public School', lastGrade: 'Grade 9', tcNumber: 'TC-7711' },
    academicHistory: [],
    userId: null,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'stu_1003',
    studentId: 'STU2026003',
    admissionNumber: 'ADM-2026-003',
    firstName: 'Karthik',
    lastName: 'Gowda',
    dateOfBirth: '2016-03-10',
    gender: 'MALE',
    phone: '+91 98765 33333',
    email: 'karthik@greenwood.edu',
    address: { street: '88 Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560011' },
    emergencyContact: { guardianName: 'Manjunath Gowda', relationship: 'Father', phone: '+91 98765 33333' },
    classId: 'cls_5',
    sectionId: 'sec_5a',
    academicYearId: 'ay_2026_27',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    documents: [],
    previousSchoolDetails: { schoolName: 'Greenwood Primary', lastGrade: 'Grade 4', tcNumber: 'TC-1122' },
    academicHistory: [],
    userId: null,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

/**
 * Get Students List (Filtered & Paginated)
 */
export const getStudents = async (req, res, next) => {
  try {
    const { classId, sectionId, search, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (classId) filter.classId = classId;
      if (sectionId) filter.sectionId = sectionId;
      if (status) filter.status = status;

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ firstName: regex }, { lastName: regex }, { studentId: regex }, { admissionNumber: regex }];
      }

      const total = await Student.countDocuments(filter);
      const students = await Student.find(filter)
        .sort({ firstName: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return sendSuccess(res, 'Students fetched', { students, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
    } else {
      let filtered = [...mockStudents];
      if (classId) filtered = filtered.filter((s) => s.classId === classId);
      if (sectionId) filtered = filtered.filter((s) => s.sectionId === sectionId);
      if (status) filtered = filtered.filter((s) => s.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (st) =>
            st.firstName.toLowerCase().includes(s) ||
            st.lastName.toLowerCase().includes(s) ||
            st.studentId.toLowerCase().includes(s) ||
            st.admissionNumber.toLowerCase().includes(s)
        );
      }

      return sendSuccess(res, 'Students fetched (Dev Mode)', {
        students: filtered,
        pagination: { total: filtered.length, page: 1, limit, pages: 1 },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Create Student
 */
export const createStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, phone, email, classId, sectionId, academicYearId, emergencyContact, previousSchoolDetails } = req.body;

    const studentId = 'STU' + Date.now().toString().slice(-6);
    const admissionNumber = 'ADM-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    if (mongoose.connection.readyState === 1) {
      const student = await Student.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        studentId,
        admissionNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        classId,
        sectionId,
        academicYearId,
        emergencyContact,
        previousSchoolDetails,
        status: 'ACTIVE',
      });
      return sendSuccess(res, 'Student created successfully', { student }, 201);
    } else {
      const student = {
        _id: 'stu_' + Date.now(),
        studentId,
        admissionNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        classId,
        sectionId,
        academicYearId,
        admissionDate: new Date().toISOString(),
        status: 'ACTIVE',
        emergencyContact: emergencyContact || {},
        previousSchoolDetails: previousSchoolDetails || {},
        documents: [],
        academicHistory: [],
        userId: null,
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockStudents.unshift(student);
      return sendSuccess(res, 'Student created successfully (Dev Mode)', { student }, 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student by ID
 */
export const getStudentById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findById(req.params.id);
      if (!student) return sendError(res, 'Student not found', null, 404);
      return sendSuccess(res, 'Student details retrieved', { student });
    } else {
      const st = mockStudents.find((s) => s._id === req.params.id);
      if (!st) return sendError(res, 'Student not found', null, 404);
      return sendSuccess(res, 'Student details retrieved (Dev Mode)', { student: st });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Promote / Transfer Student
 */
export const promoteStudent = async (req, res, next) => {
  try {
    const { targetClassId, targetSectionId, newAcademicYearId } = req.body;
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findById(req.params.id);
      if (!student) return sendError(res, 'Student not found', null, 404);

      // Save history
      student.academicHistory.push({
        academicYear: student.academicYearId,
        className: student.classId,
        sectionName: student.sectionId,
        promotedDate: new Date(),
      });

      student.classId = targetClassId;
      student.sectionId = targetSectionId;
      student.academicYearId = newAcademicYearId;
      student.status = 'PROMOTED';
      await student.save();

      return sendSuccess(res, 'Student promoted/transferred successfully', { student });
    } else {
      const st = mockStudents.find((s) => s._id === req.params.id);
      if (!st) return sendError(res, 'Student not found', null, 404);
      st.classId = targetClassId;
      st.sectionId = targetSectionId;
      st.status = 'PROMOTED';
      return sendSuccess(res, 'Student promoted (Dev Mode)', { student: st });
    }
  } catch (error) {
    next(error);
  }
};

export { mockStudents };
