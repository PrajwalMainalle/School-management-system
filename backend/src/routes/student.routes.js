import express from 'express';
import {
  getStudents,
  createStudent,
  getStudentById,
  promoteStudent,
} from '../controllers/student.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getStudents)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createStudent);

router
  .route('/:id')
  .get(getStudentById);

router
  .route('/:id/promote')
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), promoteStudent);

export default router;
