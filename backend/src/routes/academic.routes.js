import express from 'express';
import {
  getAcademicYears,
  createAcademicYear,
  getClasses,
  createClass,
  getSections,
  createSection,
  getSubjects,
  createSubject,
} from '../controllers/academic.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

// Academic Years
router.route('/years')
  .get(getAcademicYears)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createAcademicYear);

// Classes
router.route('/classes')
  .get(getClasses)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createClass);

// Sections
router.route('/sections')
  .get(getSections)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createSection);

// Subjects
router.route('/subjects')
  .get(getSubjects)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'TEACHER'), createSubject);

export default router;
