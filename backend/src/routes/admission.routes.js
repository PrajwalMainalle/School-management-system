import express from 'express';
import {
  getAdmissions,
  createEnquiry,
  approveAdmission,
} from '../controllers/admission.controller.js';
import { protect, authorizeRoles, enforceTenantIsolation } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(enforceTenantIsolation);

router
  .route('/')
  .get(getAdmissions)
  .post(createEnquiry);

router
  .route('/:id/approve')
  .post(authorizeRoles('ORGANIZER', 'SUPER_ADMIN', 'ADMIN'), approveAdmission);

export default router;
