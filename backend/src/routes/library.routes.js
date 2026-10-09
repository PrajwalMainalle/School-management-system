import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  addBook,
  getBooks,
  issueBook,
  returnBook,
  getCirculationLogs,
} from '../controllers/library.controller.js';

const router = express.Router();

router.use(protect);

router.post('/books', addBook);
router.get('/books', getBooks);
router.post('/issue', issueBook);
router.post('/return/:issueId', returnBook);
router.get('/circulation', getCirculationLogs);

export default router;
