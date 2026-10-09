import express from 'express';
import { getSchoolInfo, getBranches, getDashboardSummary } from '../controllers/school.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/info', getSchoolInfo);
router.get('/branches', getBranches);
router.get('/dashboard-summary', getDashboardSummary);

export default router;
