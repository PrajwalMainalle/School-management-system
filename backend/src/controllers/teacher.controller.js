import Teacher from '../models/teacher.model.js';
import User from '../models/user.model.js';
import Section from '../models/section.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getTeachers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (req.user?.role !== 'ORGANIZER' && req.user?.schoolId) {
      filter.schoolId = req.user.schoolId;
    } else if (req.query.schoolId) {
      filter.schoolId = req.query.schoolId;
    }

    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { teacherId: regex },
        { email: regex },
        { phone: regex },
        { specialization: regex },
      ];
    }

    const teachers = await Teacher.find(filter).sort({ firstName: 1 });
    return sendSuccess(res, 'Teachers fetched', { teachers });
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, qualification, specialization } = req.body;

    if (!firstName || !lastName || !email) {
      return sendError(res, 'First name, last name, and email are required', null, 400);
    }

    const teacherId = 'TCH' + Date.now().toString().slice(-6);
    const targetSchoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const targetBranchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    // Create or find user account
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        username: email.split('@')[0],
        password: req.body.password || 'Teacher@123',
        role: 'TEACHER',
        schoolId: targetSchoolId,
        branchId: targetBranchId,
        permissions: ['attendance:write', 'homework:write', 'marks:write'],
      });
    }

    const teacher = await Teacher.create({
      schoolId: targetSchoolId,
      branchId: targetBranchId,
      teacherId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      qualification: qualification || '',
      specialization: specialization || '',
      userId: user._id,
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Teacher created successfully', { teacher, user }, 201);
  } catch (error) {
    next(error);
  }
};

export const assignClassTeacher = async (req, res, next) => {
  try {
    const { teacherId, classId, sectionId } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return sendError(res, 'Teacher not found', null, 404);

    teacher.assignedClasses.push({ classId, sectionId, isClassTeacher: true });
    await teacher.save();

    if (sectionId) {
      await Section.findByIdAndUpdate(sectionId, { classTeacherId: teacher._id });
    }

    return sendSuccess(res, 'Class Teacher assigned successfully', { teacher });
  } catch (error) {
    next(error);
  }
};
