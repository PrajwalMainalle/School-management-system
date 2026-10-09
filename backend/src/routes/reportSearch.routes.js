import express from 'express';
import {
  globalSearch,
  getReportsData,
  exportReportCSV,
} from '../controllers/reportSearch.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/search', globalSearch);
router.get('/reports', getReportsData);
router.get('/reports/export', exportReportCSV);

export default router;
