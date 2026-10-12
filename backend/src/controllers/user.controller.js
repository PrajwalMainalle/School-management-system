import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get List of Users
 * Rule: Admin cannot see or check the data of Super Admin or Organizer!
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const filter = { ...req.tenantFilter };

    // Strict Privacy Hierarchy: Admin cannot view Super Admin or Organizer records
    if (req.user.role === 'ADMIN') {
      filter.role = { $nin: ['SUPER_ADMIN', 'ORGANIZER'] };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (req.query.role) {
      if (req.user.role === 'ADMIN' && ['SUPER_ADMIN', 'ORGANIZER'].includes(req.query.role)) {
        return sendSuccess(res, 'Users fetched successfully', {
          users: [],
          pagination: { total: 0, page, limit, pages: 0 },
        });
      }
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return sendSuccess(res, 'Users fetched successfully', {
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create New User
 * Hierarchy Rules:
 * 1. Super Admin can create Admin, Teacher, Non-Teaching Staff, Student.
 * 2. Admin CANNOT create Super Admin or Organizer. Admin can only create Teacher, Staff, Student.
 * 3. Exactly ONE Super Admin is permitted per school.
 * 4. Teachers and lower roles cannot create users.
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, username, password, role, phone, permissions, languagePreference } = req.body;

    if (!name || !email || !username || !password || !role) {
      return sendError(res, 'Name, email, username, password, and role are required', null, 400);
    }

    // Role Hierarchy Authorization Checks
    if (req.user.role === 'ADMIN') {
      if (['SUPER_ADMIN', 'ORGANIZER', 'ADMIN'].includes(role)) {
        return sendError(res, 'Access Denied: Administrators cannot create Super Admin or Admin accounts', null, 403);
      }
    } else if (req.user.role === 'TEACHER') {
      if (role !== 'STUDENT') {
        return sendError(res, 'Access Denied: Teachers are only permitted to create Student accounts', null, 403);
      }
    } else if (!['SUPER_ADMIN', 'ORGANIZER'].includes(req.user.role)) {
      return sendError(res, 'Access Denied: You do not have permission to create user accounts', null, 403);
    }

    const targetSchoolId = req.user.role === 'ORGANIZER' ? (req.body.schoolId || req.user.schoolId) : req.user.schoolId;
    const targetBranchId = req.user.role === 'ORGANIZER' ? (req.body.branchId || req.user.branchId) : req.user.branchId;

    // Strict rule: Exactly ONE Super Admin per school
    if (role === 'SUPER_ADMIN') {
      const existingSuperAdmin = await User.findOne({ schoolId: targetSchoolId, role: 'SUPER_ADMIN' });
      if (existingSuperAdmin) {
        return sendError(res, 'A Super Admin already exists for this school. Only one Super Admin is permitted per school.', null, 400);
      }
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
    });

    if (existingUser) {
      return sendError(res, 'User with this email or username already exists', null, 400);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password,
      role,
      phone: phone ? phone.trim() : '',
      permissions: permissions || [],
      languagePreference: languagePreference || 'en',
      schoolId: targetSchoolId,
      branchId: targetBranchId,
    });

    return sendSuccess(res, 'User created successfully', { user: user.toJSON() }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get User by ID
 * Rule: Admin cannot view data of Super Admin or Organizer.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (['SUPER_ADMIN', 'ORGANIZER'].includes(user.role) && req.user.role === 'ADMIN') {
      return sendError(res, 'Access Denied: Administrators cannot view Super Admin data', null, 403);
    }

    return sendSuccess(res, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User
 * Rule: Admin cannot modify Super Admin or promote to Super Admin.
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, permissions, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (['SUPER_ADMIN', 'ORGANIZER'].includes(user.role) && req.user.role === 'ADMIN') {
      return sendError(res, 'Access Denied: Administrators cannot modify Super Admin accounts', null, 403);
    }

    if (req.user.role === 'ADMIN' && role && ['SUPER_ADMIN', 'ORGANIZER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Access Denied: Administrators cannot promote users to Super Admin or Admin', null, 403);
    }

    if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      const existingSuperAdmin = await User.findOne({ schoolId: user.schoolId, role: 'SUPER_ADMIN' });
      if (existingSuperAdmin) {
        return sendError(res, 'A Super Admin already exists for this school. Only one Super Admin is permitted per school.', null, 400);
      }
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    return sendSuccess(res, 'User updated', { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle User Active Status
 * Rule: Admin cannot deactivate or toggle Super Admin.
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (req.user._id.toString() === user._id.toString()) {
      return sendError(res, 'You cannot deactivate your own account', null, 400);
    }

    if (['SUPER_ADMIN', 'ORGANIZER'].includes(user.role) && req.user.role === 'ADMIN') {
      return sendError(res, 'Access Denied: Administrators cannot toggle Super Admin status', null, 403);
    }

    user.isActive = !user.isActive;
    await user.save();
    return sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, { userId: user._id, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};
