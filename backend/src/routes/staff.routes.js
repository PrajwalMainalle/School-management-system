import express from 'express';
import { getStaff, createStaff } from '../controllers/staff.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getStaff)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createStaff);

export default router;
