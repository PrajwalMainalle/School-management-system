import express from 'express';
import { markBatchAttendance, getClassAttendance } from '../controllers/attendance.controller.js';
import { protect, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router.post('/batch', markBatchAttendance);
router.get('/class', getClassAttendance);

export default router;
