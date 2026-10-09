import mongoose from 'mongoose';
import Teacher from '../models/teacher.model.js';
import User from '../models/user.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockTeachers = [
  {
    _id: 'tch_101',
    teacherId: 'TCH2026001',
    firstName: 'Anita',
    lastName: 'Sharma',
    email: 'teacher@greenwood.edu',
    phone: '+91 98765 44444',
    qualification: 'M.Sc Mathematics, B.Ed',
    specialization: 'Mathematics & Algebra',
    joiningDate: '2022-06-01',
    assignedClasses: [{ classId: 'cls_10', sectionId: 'sec_10a', isClassTeacher: true }],
    assignedSubjects: [{ classId: 'cls_10', subjectId: 'sub_math10' }],
    status: 'ACTIVE',
    userId: 'usr_teacher',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'tch_102',
    teacherId: 'TCH2026002',
    firstName: 'Basavaraj',
    lastName: 'Patil',
    email: 'basavaraj@greenwood.edu',
    phone: '+91 98765 55555',
    qualification: 'M.A. Kannada, M.Ed',
    specialization: 'Kannada Literature & Grammar',
    joiningDate: '2021-05-15',
    assignedClasses: [],
    assignedSubjects: [{ classId: 'cls_10', subjectId: 'sub_kan10' }],
    status: 'ACTIVE',
    userId: null,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

export const getTeachers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (status) filter.status = status;
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ firstName: regex }, { lastName: regex }, { teacherId: regex }, { specialization: regex }];
      }
      const teachers = await Teacher.find(filter).sort({ firstName: 1 });
      return sendSuccess(res, 'Teachers fetched', { teachers });
    } else {
      let filtered = [...mockTeachers];
      if (status) filtered = filtered.filter((t) => t.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (tc) =>
            tc.firstName.toLowerCase().includes(s) ||
            tc.lastName.toLowerCase().includes(s) ||
            tc.teacherId.toLowerCase().includes(s) ||
            (tc.specialization && tc.specialization.toLowerCase().includes(s))
        );
      }
      return sendSuccess(res, 'Teachers fetched (Dev Mode)', { teachers: filtered });
    }
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, qualification, specialization } = req.body;
    const teacherId = 'TCH' + Date.now().toString().slice(-6);

    if (mongoose.connection.readyState === 1) {
      // Create user account
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          username: email.split('@')[0],
          password: 'Teacher@123',
          role: 'TEACHER',
          schoolId: req.user.schoolId,
          branchId: req.user.branchId,
          permissions: ['attendance:write', 'homework:write', 'marks:write'],
        });
      }

      const teacher = await Teacher.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        teacherId,
        firstName,
        lastName,
        email,
        phone,
        qualification,
        specialization,
        userId: user._id,
        status: 'ACTIVE',
      });

      return sendSuccess(res, 'Teacher created successfully', { teacher, user }, 201);
    } else {
      const teacher = {
        _id: 'tch_' + Date.now(),
        teacherId,
        firstName,
        lastName,
        email,
        phone,
        qualification,
        specialization,
        joiningDate: new Date().toISOString(),
        assignedClasses: [],
        assignedSubjects: [],
        status: 'ACTIVE',
        userId: null,
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockTeachers.unshift(teacher);
      return sendSuccess(res, 'Teacher created successfully (Dev Mode)', { teacher }, 201);
    }
  } catch (error) {
    next(error);
  }
};

export const assignClassTeacher = async (req, res, next) => {
  try {
    const { teacherId, classId, sectionId } = req.body;
    if (mongoose.connection.readyState === 1) {
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) return sendError(res, 'Teacher not found', null, 404);

      teacher.assignedClasses.push({ classId, sectionId, isClassTeacher: true });
      await teacher.save();

      await Section.findByIdAndUpdate(sectionId, { classTeacherId: teacher._id });
      return sendSuccess(res, 'Class Teacher assigned successfully', { teacher });
    } else {
      const tc = mockTeachers.find((t) => t._id === teacherId);
      if (tc) {
        tc.assignedClasses.push({ classId, sectionId, isClassTeacher: true });
        return sendSuccess(res, 'Class Teacher assigned (Dev Mode)', { teacher: tc });
      }
      return sendError(res, 'Teacher not found', null, 404);
    }
  } catch (error) {
    next(error);
  }
};
