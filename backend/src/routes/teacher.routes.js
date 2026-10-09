import express from 'express';
import { getTeachers, createTeacher, assignClassTeacher } from '../controllers/teacher.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getTeachers)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createTeacher);

router
  .route('/assign-class-teacher')
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), assignClassTeacher);

export default router;
