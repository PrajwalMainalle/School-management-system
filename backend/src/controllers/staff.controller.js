import Staff from '../models/staff.model.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getStaff = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const filter = {};
    if (req.user?.role !== 'ORGANIZER' && req.user?.schoolId) {
      filter.schoolId = req.user.schoolId;
    } else if (req.query.schoolId) {
      filter.schoolId = req.query.schoolId;
    }

    if (department) filter.department = department;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { designation: regex },
        { staffId: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const staffList = await Staff.find(filter).sort({ firstName: 1 });
    return sendSuccess(res, 'Staff list fetched', { staff: staffList });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, department, designation, permissions } = req.body;

    if (!firstName || !lastName || !email) {
      return sendError(res, 'First name, last name, and email are required', null, 400);
    }

    const staffId = 'STF' + Date.now().toString().slice(-6);
    const targetSchoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const targetBranchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        username: email.split('@')[0],
        password: req.body.password || 'Staff@123',
        role: 'NON_TEACHING_STAFF',
        schoolId: targetSchoolId,
        branchId: targetBranchId,
        permissions: permissions || [],
      });
    }

    const staff = await Staff.create({
      schoolId: targetSchoolId,
      branchId: targetBranchId,
      staffId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      department: department || 'ADMINISTRATION',
      designation: designation || 'Staff',
      permissions: permissions || [],
      userId: user._id,
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Staff member created successfully', { staff, user }, 201);
  } catch (error) {
    next(error);
  }
};
