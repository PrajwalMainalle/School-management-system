import express from 'express';
import {
  getSchoolInfo,
  updateSchoolInfo,
  getBranches,
  createBranch,
  updateBranch,
  getDashboardSummary,
} from '../controllers/school.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/info', getSchoolInfo);
router.put('/info', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), updateSchoolInfo);
router.get('/branches', getBranches);
router.post('/branches', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), createBranch);
router.put('/branches/:id', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), updateBranch);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
