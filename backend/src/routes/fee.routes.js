import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  createFeeStructure,
  getFeeStructures,
  generateInvoices,
  getInvoices,
  collectPayment,
  getFinancialSummary,
  getFinanceConfig,
  updateFinanceConfig,
  getAuditLogs,
} from '../controllers/fee.controller.js';

const router = express.Router();

router.use(protect);

// Financial routes restricted to authorized finance roles
router.post('/structures', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), createFeeStructure);
router.get('/structures', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getFeeStructures);
router.post('/invoices', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), generateInvoices);
router.get('/invoices', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getInvoices);
router.post('/payments', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), collectPayment);
router.get('/summary', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getFinancialSummary);
router.get('/config', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getFinanceConfig);
router.put('/config', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), updateFinanceConfig);
router.get('/audit-logs', authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN', 'NON_TEACHING_STAFF'), getAuditLogs);

export default router;
