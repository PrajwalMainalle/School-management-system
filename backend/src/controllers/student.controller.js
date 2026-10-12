import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get Students List (Filtered & Paginated)
 */
export const getStudents = async (req, res, next) => {
  try {
    const { classId, sectionId, search, status } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const filter = {};
    if (req.user?.role !== 'ORGANIZER' && req.user?.schoolId) {
      filter.schoolId = req.user.schoolId;
    } else if (req.query.schoolId) {
      filter.schoolId = req.query.schoolId;
    }

    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { studentId: regex },
        { admissionNumber: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return sendSuccess(res, 'Students fetched', {
      students,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Student
 */
export const createStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      classId,
      sectionId,
      academicYearId,
      emergencyContact,
      previousSchoolDetails,
      documents,
    } = req.body;

    if (!firstName || !lastName || !gender || !classId || !sectionId) {
      return sendError(res, 'First name, last name, gender, class, and section are required', null, 400);
    }

    const studentId = 'STU' + Date.now().toString().slice(-6);
    const admissionNumber = 'ADM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const targetSchoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const targetBranchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    let user = null;
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: `${firstName} ${lastName}`.trim(),
          email: cleanEmail,
          username: cleanEmail.split('@')[0],
          password: req.body.password || 'Student@123',
          role: 'STUDENT',
          schoolId: targetSchoolId,
          branchId: targetBranchId,
          permissions: [],
        });
      }
    }

    const student = await Student.create({
      schoolId: targetSchoolId,
      branchId: targetBranchId,
      userId: user ? user._id : null,
      studentId,
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2015-01-01'),
      gender,
      phone: phone || '',
      email: email || '',
      address: address || {},
      classId,
      sectionId,
      academicYearId: academicYearId || 'AY_2026_27',
      emergencyContact: emergencyContact || {},
      previousSchoolDetails: previousSchoolDetails || {},
      documents: documents || [],
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Student created successfully', { student, user }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student by ID
 */
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, 'Student not found', null, 404);
    return sendSuccess(res, 'Student details retrieved', { student });
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
    const student = await Student.findById(req.params.id);
    if (!student) return sendError(res, 'Student not found', null, 404);

    student.academicHistory.push({
      academicYear: student.academicYearId,
      className: student.classId,
      sectionName: student.sectionId,
      promotedDate: new Date(),
    });

    student.classId = targetClassId || student.classId;
    student.sectionId = targetSectionId || student.sectionId;
    if (newAcademicYearId) student.academicYearId = newAcademicYearId;
    student.status = 'PROMOTED';
    await student.save();

    return sendSuccess(res, 'Student promoted/transferred successfully', { student });
  } catch (error) {
    next(error);
  }
};
