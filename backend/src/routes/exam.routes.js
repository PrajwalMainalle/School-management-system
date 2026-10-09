import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createGradingScale,
  getGradingScales,
  createExam,
  getExams,
  saveMarksBatch,
  calculateExamResults,
  getExamReportCards,
} from '../controllers/exam.controller.js';

const router = express.Router();

router.use(protect);

router.post('/grading-scales', createGradingScale);
router.get('/grading-scales', getGradingScales);
router.post('/', createExam);
router.get('/', getExams);
router.post('/marks', saveMarksBatch);
router.post('/calculate-results', calculateExamResults);
router.get('/report-cards', getExamReportCards);

export default router;
