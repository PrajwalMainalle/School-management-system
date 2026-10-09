import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate JWT Token for authenticated user
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    role: user.role,
    schoolId: user.schoolId,
    branchId: user.branchId,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_2026';
  return jwt.verify(token, secret);
};

/**
 * Generate a random reset token and hash for password reset workflow
 */
export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  return { resetToken, hashedToken, expiresAt };
};
