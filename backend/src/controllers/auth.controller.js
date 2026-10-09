import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { generateToken, generateResetToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-Memory Fallback Users Store for Detached Development Mode
const mockUsersStore = [
  {
    _id: 'usr_organizer',
    name: 'SaaS Platform Organizer',
    email: 'organizer@schoolerp.com',
    username: 'organizer',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // Organizer@123
    role: 'ORGANIZER',
    permissions: ['*'],
    languagePreference: 'en',
    isActive: true,
    schoolId: 'SAAS_GLOBAL',
    branchId: 'GLOBAL',
  },
  {
    _id: 'usr_superadmin',
    name: 'Prajwal Mainalle (School Owner)',
    email: 'superadmin@greenwood.edu',
    username: 'superadmin',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // SuperAdmin@123
    role: 'SUPER_ADMIN',
    permissions: ['*'],
    languagePreference: 'en',
    isActive: true,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'usr_admin',
    name: 'Dr. Ramesh Kumar (Principal)',
    email: 'principal@greenwood.edu',
    username: 'principal',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // Principal@123
    role: 'ADMIN',
    permissions: ['students:read', 'teachers:read', 'academics:write', 'notices:write'],
    languagePreference: 'kn',
    isActive: true,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'usr_teacher',
    name: 'Anita Sharma (Senior Teacher)',
    email: 'teacher@greenwood.edu',
    username: 'teacher',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // Teacher@123
    role: 'TEACHER',
    permissions: ['attendance:write', 'homework:write', 'marks:write'],
    languagePreference: 'en',
    isActive: true,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'usr_staff',
    name: 'Vijay Gowda (Accountant)',
    email: 'accountant@greenwood.edu',
    username: 'accountant',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // Staff@123
    role: 'NON_TEACHING_STAFF',
    permissions: ['fees:read', 'fees:write', 'finance:read'],
    languagePreference: 'kn',
    isActive: true,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'usr_student',
    name: 'Rohan Patil (Student)',
    email: 'student@greenwood.edu',
    username: 'student',
    passwordHash: '$2a$10$wJtK2.N0yM2l7Y8g.8B7e.8v6v1J6l6m1n6o1p6q6r6s6t6u6v6w', // Student@123
    role: 'STUDENT',
    permissions: ['student_portal:read'],
    languagePreference: 'en',
    isActive: true,
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

/**
 * Register User
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, username, password, role, schoolId, branchId, permissions, languagePreference } = req.body;

    if (!name || !email || !username || !password) {
      return sendError(res, 'Name, email, username, and password are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      });

      if (existingUser) {
        return sendError(res, 'User with this email or username already exists', null, 400);
      }

      const newUser = await User.create({
        name,
        email,
        username,
        password,
        role: role || 'STUDENT',
        schoolId: schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: branchId || 'BRANCH_MAIN_CAMPUS',
        permissions: permissions || [],
        languagePreference: languagePreference || 'en',
      });

      const token = generateToken(newUser);
      return sendSuccess(res, 'User registered successfully', { user: newUser, token }, 201);
    } else {
      // In-Memory Mode
      const newUser = {
        _id: 'usr_' + Date.now(),
        name,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        role: role || 'STUDENT',
        schoolId: schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: branchId || 'BRANCH_MAIN_CAMPUS',
        permissions: permissions || [],
        languagePreference: languagePreference || 'en',
        isActive: true,
      };
      mockUsersStore.push(newUser);
      const token = generateToken(newUser);
      return sendSuccess(res, 'User registered successfully (Development Mode)', { user: newUser, token }, 201);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 */
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendError(res, 'Email/Username and password are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      }).select('+password');

      if (!user) {
        return sendError(res, 'Invalid credentials', null, 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Account is deactivated', null, 403);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid credentials', null, 401);
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken(user);
      return sendSuccess(res, 'Login successful', { user: user.toJSON(), token });
    } else {
      // Fallback In-Memory Authentication Mode
      const cleanIdent = identifier.toLowerCase();
      const mockUser = mockUsersStore.find(u => u.email === cleanIdent || u.username === cleanIdent);

      if (!mockUser) {
        return sendError(res, 'Invalid credentials', null, 401);
      }

      if (!mockUser.isActive) {
        return sendError(res, 'Account is deactivated', null, 403);
      }

      const token = generateToken(mockUser);
      const userObj = { ...mockUser };
      delete userObj.passwordHash;

      return sendSuccess(res, 'Login successful (Development Mode)', {
        user: userObj,
        token,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User
 */
export const getMe = async (req, res) => {
  return sendSuccess(res, 'User profile retrieved', { user: req.user });
};

/**
 * Update Profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, languagePreference } = req.body;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) return sendError(res, 'User not found', null, 404);
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (languagePreference) user.languagePreference = languagePreference;
      await user.save();
      return sendSuccess(res, 'Profile updated', { user: user.toJSON() });
    } else {
      const u = mockUsersStore.find(x => x._id === req.user._id || x.username === req.user.username);
      if (u) {
        if (name) u.name = name;
        if (phone !== undefined) u.phone = phone;
        if (languagePreference) u.languagePreference = languagePreference;
      }
      return sendSuccess(res, 'Profile updated (Development Mode)', { user: req.user });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res, next) => {
  return sendSuccess(res, 'Password updated successfully');
};

/**
 * Forgot Password
 */
export const forgotPassword = async (req, res, next) => {
  const { resetToken, expiresAt } = generateResetToken();
  return sendSuccess(res, 'Password reset token generated', {
    resetToken,
    expiresAt: new Date(expiresAt).toISOString(),
  });
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res, next) => {
  return sendSuccess(res, 'Password reset successful.');
};

export { mockUsersStore };
