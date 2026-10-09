import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus,
} from '../controllers/user.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user management routes require authentication and tenant isolation
router.use(protect);
router.use(enforceTenantIsolation);

// Super Admin, Admin, and Organizer can manage users
router
  .route('/')
  .get(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), getUsers)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createUser);

router
  .route('/:id')
  .get(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), getUserById)
  .put(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), updateUser);

router
  .route('/:id/status')
  .patch(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), toggleUserStatus);

export default router;
