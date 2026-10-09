import { verifyToken } from '../utils/token.js';
import User from '../models/user.model.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Protect routes - Verifies JWT Bearer Token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Please sign in to access this page', null, 401);
    }

    const decoded = verifyToken(token);
    
    // Find user in memory or DB
    let user;
    if (User.db.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      // Mock detached mode user if DB disconnected
      user = {
        _id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        schoolId: decoded.schoolId,
        branchId: decoded.branchId,
        isActive: true,
      };
    }

    if (!user) {
      return sendError(res, 'User session invalid. Please log in again', null, 401);
    }

    if (user.isActive === false) {
      return sendError(res, 'Your account is deactivated. Please contact your administrator', null, 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Your login session has expired. Please log in again', error.message, 401);
  }
};

/**
 * Authorize Roles Middleware
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Please sign in to continue', null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        'Access Restricted: You do not have permission to perform this action',
        null,
        403
      );
    }

    next();
  };
};

/**
 * Check Permission Middleware
 */
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Please sign in to continue', null, 401);
    }

    // ORGANIZER and SUPER_ADMIN have full operational permissions by default
    if (['ORGANIZER', 'SUPER_ADMIN'].includes(req.user.role)) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('*')) {
      return sendError(
        res,
        'Access Restricted: Additional permissions are required for this section',
        null,
        403
      );
    }

    next();
  };
};

/**
 * Tenant Isolation Middleware (Multi-Tenant Scoping)
 */
export const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) return next();

  // ORGANIZER is the SaaS platform owner, doesn't lock to a single school unless specified
  if (req.user.role === 'ORGANIZER') {
    req.tenantFilter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    return next();
  }

  // All school-level users are strictly isolated to their own schoolId & branchId
  req.tenantFilter = {
    schoolId: req.user.schoolId,
    branchId: req.user.branchId,
  };

  next();
};
