import express from 'express';
import { getLeaveRequests, applyLeave, updateLeaveStatus } from '../controllers/leave.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getLeaveRequests)
  .post(applyLeave);

router
  .route('/:id/status')
  .patch(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), updateLeaveStatus);

export default router;
