import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { mockUsersStore } from './auth.controller.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get List of Users
 */
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (mongoose.connection.readyState === 1) {
      const filter = { ...req.tenantFilter };

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
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    } else {
      // In-memory mode
      let filtered = [...mockUsersStore];
      if (req.query.role) {
        filtered = filtered.filter(u => u.role === req.query.role);
      }
      if (req.query.search) {
        const s = req.query.search.toLowerCase();
        filtered = filtered.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.username.toLowerCase().includes(s));
      }

      return sendSuccess(res, 'Users fetched successfully (Development Mode)', {
        users: filtered,
        pagination: { total: filtered.length, page: 1, limit, pages: 1 },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Create New User
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, username, password, role, phone, permissions, languagePreference } = req.body;

    if (!name || !email || !username || !password || !role) {
      return sendError(res, 'Name, email, username, password, and role are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });

      if (existingUser) {
        return sendError(res, 'User with this email or username already exists', null, 400);
      }

      const targetSchoolId = req.user.role === 'ORGANIZER' ? (req.body.schoolId || 'SCHOOL_GREENWOOD_MAIN') : req.user.schoolId;
      const targetBranchId = req.user.role === 'ORGANIZER' ? (req.body.branchId || 'BRANCH_MAIN_CAMPUS') : req.user.branchId;

      const user = await User.create({
        name,
        email,
        username,
        password,
        role,
        phone: phone || '',
        permissions: permissions || [],
        languagePreference: languagePreference || 'en',
        schoolId: targetSchoolId,
        branchId: targetBranchId,
      });

      return sendSuccess(res, 'User created successfully', { user: user.toJSON() }, 201);
    } else {
      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        role,
        phone: phone || '',
        permissions: permissions || [],
        languagePreference: languagePreference || 'en',
        isActive: true,
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockUsersStore.push(newUser);
      return sendSuccess(res, 'User created successfully (Development Mode)', { user: newUser }, 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get User by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, 'User not found', null, 404);
      return sendSuccess(res, 'User retrieved', { user });
    } else {
      const u = mockUsersStore.find(x => x._id === req.params.id);
      if (!u) return sendError(res, 'User not found', null, 404);
      return sendSuccess(res, 'User retrieved', { user: u });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update User
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, permissions, isActive } = req.body;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, 'User not found', null, 404);
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (role) user.role = role;
      if (permissions) user.permissions = permissions;
      if (isActive !== undefined) user.isActive = isActive;
      await user.save();
      return sendSuccess(res, 'User updated', { user: user.toJSON() });
    } else {
      const u = mockUsersStore.find(x => x._id === req.params.id);
      if (!u) return sendError(res, 'User not found', null, 404);
      if (name) u.name = name;
      if (phone !== undefined) u.phone = phone;
      if (role) u.role = role;
      if (permissions) u.permissions = permissions;
      if (isActive !== undefined) u.isActive = isActive;
      return sendSuccess(res, 'User updated (Development Mode)', { user: u });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle User Active Status
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, 'User not found', null, 404);
      user.isActive = !user.isActive;
      await user.save();
      return sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'}`, { userId: user._id, isActive: user.isActive });
    } else {
      const u = mockUsersStore.find(x => x._id === req.params.id);
      if (!u) return sendError(res, 'User not found', null, 404);
      u.isActive = !u.isActive;
      return sendSuccess(res, `User ${u.isActive ? 'activated' : 'deactivated'} (Development Mode)`, { userId: u._id, isActive: u.isActive });
    }
  } catch (error) {
    next(error);
  }
};
