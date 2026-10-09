import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  createSalaryStructure,
  getSalaryStructures,
  processMonthlyPayroll,
  getPayslips,
  disbursePayslip,
} from '../controllers/payroll.controller.js';

const router = express.Router();

router.use(protect);

// Payroll routes restricted to authorized management roles
router.post('/salary-structures', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), createSalaryStructure);
router.get('/salary-structures', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getSalaryStructures);
router.post('/process', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), processMonthlyPayroll);
router.get('/payslips', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getPayslips);
router.patch('/payslips/:payslipId/disburse', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), disbursePayslip);

export default router;
