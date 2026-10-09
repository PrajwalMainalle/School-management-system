import express from 'express';
import {
  getHostels,
  addHostel,
  getRooms,
  addRoom,
  allocateBed,
  getAllocations,
  checkoutStudent,
} from '../controllers/hostel.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Hostels
router.get('/hostels', getHostels);
router.post('/hostels', addHostel);

// Rooms
router.get('/rooms', getRooms);
router.post('/rooms', addRoom);

// Allocations
router.get('/allocations', getAllocations);
router.post('/allocations', allocateBed);
router.put('/allocations/:allocationId/checkout', checkoutStudent);

export default router;
