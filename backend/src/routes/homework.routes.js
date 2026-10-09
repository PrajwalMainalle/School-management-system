import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createHomework,
  getHomeworkList,
  getHomeworkDetails,
  submitAssignment,
  evaluateSubmission,
  createStudyMaterial,
  getStudyMaterials,
} from '../controllers/homework.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', createHomework);
router.get('/', getHomeworkList);
router.get('/study-materials', getStudyMaterials);
router.post('/study-materials', createStudyMaterial);
router.get('/:id', getHomeworkDetails);
router.post('/submit', submitAssignment);
router.patch('/submissions/:submissionId/evaluate', evaluateSubmission);

export default router;
