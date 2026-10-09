import mongoose from 'mongoose';
import Vehicle from '../models/vehicle.model.js';
import Driver from '../models/driver.model.js';
import Route from '../models/route.model.js';
import TransportAssignment from '../models/transportAssignment.model.js';
import VehicleMaintenance from '../models/vehicleMaintenance.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Fallback in-memory stores for dev mode when MongoDB is detached
let mockVehicles = [];
let mockDrivers = [];
let mockRoutes = [];
let mockAssignments = [];
let mockMaintenances = [];

/**
 * Get Vehicles
 */
export const getVehicles = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const vehicles = await Vehicle.find({ schoolId });
      return sendSuccess(res, 'Vehicles fetched successfully', vehicles);
    }
    return sendSuccess(res, 'Vehicles fetched (Dev Mode)', mockVehicles);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Add Vehicle
 */
export const addVehicle = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const {
      vehicleNumber,
      vehicleType = 'BUS',
      model = '',
      capacity = 40,
      registrationDetails = '',
      insuranceNumber = '',
      insuranceExpiry = '',
      fitnessExpiry = '',
      pollutionCertificateExpiry = '',
      permitExpiry = '',
      assignedDriverId = '',
      assignedHelperName = '',
      assignedHelperPhone = '',
      status = 'ACTIVE',
    } = req.body;

    if (!vehicleNumber || !capacity) {
      return sendError(res, 'vehicleNumber and capacity are required', null, 400);
    }

    let vehicleDoc;
    if (mongoose.connection.readyState === 1) {
      const existing = await Vehicle.findOne({ schoolId, vehicleNumber });
      if (existing) {
        return sendError(res, 'Vehicle with this registration number already exists', null, 400);
      }
      vehicleDoc = await Vehicle.create({
        schoolId,
        vehicleNumber,
        vehicleType,
        model,
        capacity: Number(capacity),
        registrationDetails,
        insuranceNumber,
        insuranceExpiry,
        fitnessExpiry,
        pollutionCertificateExpiry,
        permitExpiry,
        assignedDriverId,
        assignedHelperName,
        assignedHelperPhone,
        status,
      });
    } else {
      const existing = mockVehicles.find((v) => v.vehicleNumber === vehicleNumber);
      if (existing) {
        return sendError(res, 'Vehicle with this registration number already exists', null, 400);
      }
      vehicleDoc = {
        _id: 'vh_' + Date.now(),
        schoolId,
        vehicleNumber,
        vehicleType,
        model,
        capacity: Number(capacity),
        registrationDetails,
        insuranceNumber,
        insuranceExpiry,
        fitnessExpiry,
        pollutionCertificateExpiry,
        permitExpiry,
        assignedDriverId,
        assignedHelperName,
        assignedHelperPhone,
        status,
        createdAt: new Date().toISOString(),
      };
      mockVehicles.push(vehicleDoc);
    }

    return sendSuccess(res, 'Vehicle added successfully', vehicleDoc, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Drivers
 */
export const getDrivers = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const drivers = await Driver.find({ schoolId });
      return sendSuccess(res, 'Drivers fetched successfully', drivers);
    }
    return sendSuccess(res, 'Drivers fetched (Dev Mode)', mockDrivers);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Add Driver
 */
export const addDriver = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const {
      name,
      phone,
      licenseNumber,
      licenseCategory = 'HEAVY_MOTOR_VEHICLE',
      licenseExpiry,
      address = '',
      joiningDate = '',
      assignedVehicleId = '',
      status = 'ACTIVE',
    } = req.body;

    if (!name || !phone || !licenseNumber || !licenseExpiry) {
      return sendError(res, 'name, phone, licenseNumber, and licenseExpiry are required', null, 400);
    }

    let driverDoc;
    if (mongoose.connection.readyState === 1) {
      const existing = await Driver.findOne({ schoolId, licenseNumber });
      if (existing) {
        return sendError(res, 'Driver with this license number already exists', null, 400);
      }
      driverDoc = await Driver.create({
        schoolId,
        driverId: 'DRV-' + Date.now().toString().slice(-6),
        name,
        phone,
        address,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        joiningDate,
        assignedVehicleId,
        status,
      });
    } else {
      const existing = mockDrivers.find((d) => d.licenseNumber === licenseNumber);
      if (existing) {
        return sendError(res, 'Driver with this license number already exists', null, 400);
      }
      driverDoc = {
        _id: 'drv_' + Date.now(),
        schoolId,
        driverId: 'DRV-' + Date.now().toString().slice(-6),
        name,
        phone,
        address,
        licenseNumber,
        licenseCategory,
        licenseExpiry,
        joiningDate,
        assignedVehicleId,
        status,
        createdAt: new Date().toISOString(),
      };
      mockDrivers.push(driverDoc);
    }

    return sendSuccess(res, 'Driver created successfully', driverDoc, 201);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Routes
 */
export const getRoutes = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const routes = await Route.find({ schoolId });
      return sendSuccess(res, 'Routes fetched successfully', routes);
    }
    return sendSuccess(res, 'Routes fetched (Dev Mode)', mockRoutes);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Route
 */
export const addRoute = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const {
      routeName,
      routeCode,
      startPoint,
      destination,
      vehicleId = '',
      driverId = '',
      stops = [],
      status = 'ACTIVE',
    } = req.body;

    if (!routeName || !routeCode || !startPoint || !destination) {
      return sendError(res, 'routeName, routeCode, startPoint, and destination are required', null, 400);
    }

    let routeDoc;
    if (mongoose.connection.readyState === 1) {
      const existing = await Route.findOne({ schoolId, routeCode });
      if (existing) {
        return sendError(res, 'Route with this code already exists', null, 400);
      }
      routeDoc = await Route.create({
        schoolId,
        routeName,
        routeCode,
        startPoint,
        destination,
        vehicleId,
        driverId,
        stops,
        status,
      });
    } else {
      const existing = mockRoutes.find((r) => r.routeCode === routeCode);
      if (existing) {
        return sendError(res, 'Route with this code already exists', null, 400);
      }
      routeDoc = {
        _id: 'rt_' + Date.now(),
        schoolId,
        routeName,
        routeCode,
        startPoint,
        destination,
        vehicleId,
        driverId,
        stops,
        status,
        createdAt: new Date().toISOString(),
      };
      mockRoutes.push(routeDoc);
    }

    return sendSuccess(res, 'Transport route created successfully', routeDoc, 201);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Assign Student to Transport Route with Business Rule Validation
 */
export const assignStudentTransport = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const {
      studentId,
      routeId,
      pickupStopName,
      dropStopName,
      monthlyFare = 0,
      academicYearId = 'ay_2026_27',
      startDate = new Date().toISOString().split('T')[0],
      endDate = '',
    } = req.body;

    if (!studentId || !routeId || !pickupStopName || !dropStopName) {
      return sendError(res, 'studentId, routeId, pickupStopName, and dropStopName are required', null, 400);
    }

    let targetRoute, targetVehicle;
    if (mongoose.connection.readyState === 1) {
      // 1. Check Route & Vehicle
      targetRoute = await Route.findById(routeId);
      if (!targetRoute) {
        return sendError(res, 'Target transport route not found', null, 404);
      }

      if (targetRoute.vehicleId) {
        targetVehicle = await Vehicle.findById(targetRoute.vehicleId);
        if (targetVehicle && targetVehicle.status !== 'ACTIVE') {
          return sendError(res, 'Assigned vehicle for this route is currently not active', null, 400);
        }
      }

      // 2. Prevent Duplicate Active Assignment
      const existingAssign = await TransportAssignment.findOne({
        schoolId,
        studentId,
        academicYearId,
        status: 'ACTIVE',
      });
      if (existingAssign) {
        return sendError(res, 'Student already has an active transport assignment for this academic session', null, 400);
      }

      // 3. Prevent Vehicle Over-Capacity
      if (targetVehicle) {
        const activeCountOnRoute = await TransportAssignment.countDocuments({
          schoolId,
          routeId,
          status: 'ACTIVE',
        });
        if (activeCountOnRoute >= targetVehicle.capacity) {
          return sendError(res, `Vehicle capacity reached! Maximum capacity is ${targetVehicle.capacity} passengers.`, null, 400);
        }
      }

      // Create Assignment
      const assignmentDoc = await TransportAssignment.create({
        schoolId,
        academicYearId,
        studentId,
        routeId,
        pickupStopName,
        dropStopName,
        monthlyFare: Number(monthlyFare),
        startDate,
        endDate,
        status: 'ACTIVE',
      });

      return sendSuccess(res, 'Student assigned to transport route successfully', assignmentDoc, 201);
    } else {
      // Dev In-Memory Mode
      targetRoute = mockRoutes.find((r) => r._id === routeId || r.routeCode === routeId);
      const existingAssign = mockAssignments.find(
        (a) => a.studentId === studentId && a.status === 'ACTIVE'
      );
      if (existingAssign) {
        return sendError(res, 'Student already has an active transport assignment for this academic session', null, 400);
      }

      if (targetRoute && targetRoute.vehicleId) {
        targetVehicle = mockVehicles.find((v) => v._id === targetRoute.vehicleId);
        if (targetVehicle) {
          const countOnRoute = mockAssignments.filter((a) => a.routeId === routeId && a.status === 'ACTIVE').length;
          if (countOnRoute >= targetVehicle.capacity) {
            return sendError(res, `Vehicle capacity reached! Maximum capacity is ${targetVehicle.capacity} passengers.`, null, 400);
          }
        }
      }

      const assignmentDoc = {
        _id: 'ta_' + Date.now(),
        schoolId,
        academicYearId,
        studentId,
        routeId,
        pickupStopName,
        dropStopName,
        monthlyFare: Number(monthlyFare),
        startDate,
        endDate,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      mockAssignments.push(assignmentDoc);

      return sendSuccess(res, 'Student assigned to transport route successfully (Dev Mode)', assignmentDoc, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Assignments
 */
export const getAssignments = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const assignments = await TransportAssignment.find({ schoolId });
      return sendSuccess(res, 'Transport assignments fetched successfully', assignments);
    }
    return sendSuccess(res, 'Transport assignments fetched (Dev Mode)', mockAssignments);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Vehicle Maintenances
 */
export const getMaintenances = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const logs = await VehicleMaintenance.find({ schoolId });
      return sendSuccess(res, 'Vehicle maintenance logs fetched', logs);
    }
    return sendSuccess(res, 'Vehicle maintenance logs fetched (Dev Mode)', mockMaintenances);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Vehicle Maintenance Log
 */
export const addMaintenance = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { vehicleId, maintenanceType = 'SERVICE', cost, description = '', serviceDate, nextServiceDueDate = '', performedBy = '' } = req.body;

    if (!vehicleId || !cost || !serviceDate) {
      return sendError(res, 'vehicleId, cost, and serviceDate are required', null, 400);
    }

    let logDoc;
    if (mongoose.connection.readyState === 1) {
      logDoc = await VehicleMaintenance.create({
        schoolId,
        vehicleId,
        maintenanceType,
        cost: Number(cost),
        description,
        serviceDate,
        nextServiceDueDate,
        performedBy,
      });
    } else {
      logDoc = {
        _id: 'vm_' + Date.now(),
        schoolId,
        vehicleId,
        maintenanceType,
        cost: Number(cost),
        description,
        serviceDate,
        nextServiceDueDate,
        performedBy,
        createdAt: new Date().toISOString(),
      };
      mockMaintenances.push(logDoc);
    }

    return sendSuccess(res, 'Vehicle maintenance log added successfully', logDoc, 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
