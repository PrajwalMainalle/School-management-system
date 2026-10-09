import mongoose from 'mongoose';
import Staff from '../models/staff.model.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockStaff = [
  {
    _id: 'stf_101',
    staffId: 'STF2026001',
    firstName: 'Vijay',
    lastName: 'Gowda',
    email: 'accountant@greenwood.edu',
    phone: '+91 98765 66666',
    department: 'ACCOUNTING',
    designation: 'Chief Accountant',
    joiningDate: '2020-03-10',
    permissions: ['fees:read', 'fees:write', 'finance:read', 'finance:write'],
    status: 'ACTIVE',
    userId: 'usr_staff',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'stf_102',
    staffId: 'STF2026002',
    firstName: 'Meenakshi',
    lastName: 'Sundaram',
    email: 'librarian@greenwood.edu',
    phone: '+91 98765 77777',
    department: 'LIBRARY',
    designation: 'Head Librarian',
    joiningDate: '2021-08-01',
    permissions: ['library:read', 'library:write', 'books:manage'],
    status: 'ACTIVE',
    userId: null,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'stf_103',
    staffId: 'STF2026003',
    firstName: 'Gurumoorthy',
    lastName: 'N',
    email: 'driver@greenwood.edu',
    phone: '+91 98765 88888',
    department: 'TRANSPORT',
    designation: 'School Bus Driver (Route 4)',
    joiningDate: '2023-01-15',
    permissions: ['transport:read'],
    status: 'ACTIVE',
    userId: null,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

export const getStaff = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (department) filter.department = department;
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ firstName: regex }, { lastName: regex }, { designation: regex }, { staffId: regex }];
      }
      const staffList = await Staff.find(filter).sort({ firstName: 1 });
      return sendSuccess(res, 'Staff list fetched', { staff: staffList });
    } else {
      let filtered = [...mockStaff];
      if (department) filtered = filtered.filter((s) => s.department === department);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (st) =>
            st.firstName.toLowerCase().includes(s) ||
            st.lastName.toLowerCase().includes(s) ||
            st.designation.toLowerCase().includes(s) ||
            st.staffId.toLowerCase().includes(s)
        );
      }
      return sendSuccess(res, 'Staff list fetched (Dev Mode)', { staff: filtered });
    }
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, department, designation, permissions } = req.body;
    const staffId = 'STF' + Date.now().toString().slice(-6);

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          username: email.split('@')[0],
          password: 'Staff@123',
          role: 'NON_TEACHING_STAFF',
          schoolId: req.user.schoolId,
          branchId: req.user.branchId,
          permissions: permissions || [],
        });
      }

      const staff = await Staff.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        staffId,
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        permissions: permissions || [],
        userId: user._id,
        status: 'ACTIVE',
      });

      return sendSuccess(res, 'Staff member created successfully', { staff, user }, 201);
    } else {
      const staff = {
        _id: 'stf_' + Date.now(),
        staffId,
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        joiningDate: new Date().toISOString(),
        permissions: permissions || [],
        status: 'ACTIVE',
        userId: null,
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockStaff.unshift(staff);
      return sendSuccess(res, 'Staff member created successfully (Dev Mode)', { staff }, 201);
    }
  } catch (error) {
    next(error);
  }
};
