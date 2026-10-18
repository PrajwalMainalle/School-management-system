import User from '../models/user.model.js';
import School from '../models/school.model.js';
import Branch from '../models/branch.model.js';
import { generateToken, generateResetToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Register User
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, username, password, role, phone, schoolName, languagePreference } = req.body;

    if (!name || !email || !username || !password) {
      return sendError(res, 'Name, email, username, and password are required', null, 400);
    }

    // Public Registration Rule: ONLY Super Admin can register publicly.
    // All other roles (Teachers, Staff, Students, Admins) must be created by higher authorities inside the portal.
    if (role && role !== 'SUPER_ADMIN') {
      return sendError(
        res,
        'Public registration is restricted to School Owners (Super Admin). Teachers, Staff, and Students must be provisioned internally by their school administration.',
        null,
        403
      );
    }

    if (!schoolName || !schoolName.trim()) {
      return sendError(res, 'School Name is required to register a school Super Admin account', null, 400);
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
    });

    if (existingUser) {
      return sendError(res, 'User with this email or username already exists', null, 400);
    }

    // Determine or create School tenant
    const schoolCode = schoolName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SCH';
    let school = await School.findOne({
      $or: [{ code: schoolCode }, { name: schoolName.trim() }],
    });

    if (school) {
      // Exactly ONE Super Admin per school
      const existingSuperAdmin = await User.findOne({
        schoolId: school._id.toString(),
        role: 'SUPER_ADMIN',
      });
      if (existingSuperAdmin) {
        return sendError(
          res,
          `A Super Admin already exists for "${school.name}". Exactly one Super Admin is permitted per school.`,
          null,
          400
        );
      }
    } else {
      school = await School.create({
        name: schoolName.trim(),
        code: schoolCode,
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : '',
        isActive: true,
      });
    }

    const targetSchoolId = school._id.toString();

    let branch = await Branch.findOne({ schoolId: targetSchoolId });
    if (!branch) {
      branch = await Branch.create({
        schoolId: targetSchoolId,
        branchName: 'Main Campus',
        branchCode: `${schoolCode}-MAIN`,
        isMainBranch: true,
        phone: phone ? phone.trim() : '',
        isActive: true,
      });
    }
    const targetBranchId = branch._id.toString();

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password,
      role: 'SUPER_ADMIN',
      phone: phone ? phone.trim() : '',
      schoolId: targetSchoolId,
      branchId: targetBranchId,
      permissions: ['*'],
      languagePreference: languagePreference || 'en',
    });

    const token = generateToken(newUser);
    return sendSuccess(res, 'School and Super Admin registered successfully', { user: newUser, token }, 201);
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

    const cleanIdent = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanIdent }, { username: cleanIdent }],
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

    // Safely update lastLogin timestamp without triggering document versioning errors or hooks
    try {
      await User.findByIdAndUpdate(user._id, { $set: { lastLogin: new Date() } });
    } catch (saveErr) {
      console.warn('[Auth Warning] Failed to update lastLogin timestamp:', saveErr.message);
    }

    const token = generateToken(user);
    return sendSuccess(res, 'Login successful', { user: user.toJSON(), token });
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
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (languagePreference) user.languagePreference = languagePreference;
    await user.save();

    return sendSuccess(res, 'Profile updated', { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', null, 400);
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return sendError(res, 'User not found', null, 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password does not match', null, 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required', null, 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, 'No user found with that email', null, 404);

    const { resetToken, expiresAt } = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = expiresAt;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 'Password reset token generated', {
      resetToken,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', null, 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Password reset token is invalid or has expired', null, 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};
