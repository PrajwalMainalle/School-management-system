import express from 'express';
import { getClassTimetable, createPeriod, deletePeriod } from '../controllers/timetable.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getClassTimetable)
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createPeriod);

router
  .route('/:id')
  .delete(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), deletePeriod);

export default router;
