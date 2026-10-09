import express from 'express';
import {
  getVehicles,
  addVehicle,
  getDrivers,
  addDriver,
  getRoutes,
  addRoute,
  assignStudentTransport,
  getAssignments,
  getMaintenances,
  addMaintenance,
} from '../controllers/transport.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Vehicles
router.get('/vehicles', getVehicles);
router.post('/vehicles', addVehicle);

// Drivers
router.get('/drivers', getDrivers);
router.post('/drivers', addDriver);

// Routes
router.get('/routes', getRoutes);
router.post('/routes', addRoute);

// Assignments & Capacity Rules
router.get('/assignments', getAssignments);
router.post('/assignments', assignStudentTransport);

// Maintenance
router.get('/maintenance', getMaintenances);
router.post('/maintenance', addMaintenance);

export default router;
