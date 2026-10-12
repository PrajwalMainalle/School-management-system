import Vehicle from '../models/vehicle.model.js';
import Driver from '../models/driver.model.js';
import Route from '../models/route.model.js';
import TransportAssignment from '../models/transportAssignment.model.js';
import VehicleMaintenance from '../models/vehicleMaintenance.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get Vehicles
 */
export const getVehicles = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const vehicles = await Vehicle.find({ schoolId });
    return sendSuccess(res, 'Vehicles fetched successfully', vehicles);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Vehicle
 */
export const addVehicle = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
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

    const existing = await Vehicle.findOne({ schoolId, vehicleNumber });
    if (existing) {
      return sendError(res, 'Vehicle with this registration number already exists', null, 400);
    }

    const vehicleDoc = await Vehicle.create({
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

    return sendSuccess(res, 'Vehicle added successfully', vehicleDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Drivers
 */
export const getDrivers = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const drivers = await Driver.find({ schoolId });
    return sendSuccess(res, 'Drivers fetched successfully', drivers);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Driver
 */
export const addDriver = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
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

    const existing = await Driver.findOne({ schoolId, licenseNumber });
    if (existing) {
      return sendError(res, 'Driver with this license number already exists', null, 400);
    }

    const driverDoc = await Driver.create({
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

    return sendSuccess(res, 'Driver created successfully', driverDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Routes
 */
export const getRoutes = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const routes = await Route.find({ schoolId });
    return sendSuccess(res, 'Routes fetched successfully', routes);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Route
 */
export const addRoute = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
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

    const existing = await Route.findOne({ schoolId, routeCode });
    if (existing) {
      return sendError(res, 'Route with this code already exists', null, 400);
    }

    const routeDoc = await Route.create({
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

    return sendSuccess(res, 'Transport route created successfully', routeDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Assign Student to Transport Route with Business Rule Validation
 */
export const assignStudentTransport = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const {
      studentId,
      routeId,
      pickupStopName,
      dropStopName,
      monthlyFare = 0,
      academicYearId = 'AY_2026_27',
      startDate = new Date().toISOString().split('T')[0],
      endDate = '',
    } = req.body;

    if (!studentId || !routeId || !pickupStopName || !dropStopName) {
      return sendError(res, 'studentId, routeId, pickupStopName, and dropStopName are required', null, 400);
    }

    const targetRoute = await Route.findById(routeId);
    if (!targetRoute) {
      return sendError(res, 'Target transport route not found', null, 404);
    }

    let targetVehicle;
    if (targetRoute.vehicleId) {
      targetVehicle = await Vehicle.findById(targetRoute.vehicleId);
      if (targetVehicle && targetVehicle.status !== 'ACTIVE') {
        return sendError(res, 'Assigned vehicle for this route is currently not active', null, 400);
      }
    }

    const existingAssign = await TransportAssignment.findOne({
      schoolId,
      studentId,
      academicYearId,
      status: 'ACTIVE',
    });
    if (existingAssign) {
      return sendError(res, 'Student already has an active transport assignment for this academic session', null, 400);
    }

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
  } catch (err) {
    next(err);
  }
};

/**
 * Get Assignments
 */
export const getAssignments = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const assignments = await TransportAssignment.find({ schoolId });
    return sendSuccess(res, 'Transport assignments fetched successfully', assignments);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Vehicle Maintenances
 */
export const getMaintenances = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const logs = await VehicleMaintenance.find({ schoolId });
    return sendSuccess(res, 'Vehicle maintenance logs fetched', logs);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Vehicle Maintenance Log
 */
export const addMaintenance = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const { vehicleId, maintenanceType = 'SERVICE', cost, description = '', serviceDate, nextServiceDueDate = '', performedBy = '' } = req.body;

    if (!vehicleId || !cost || !serviceDate) {
      return sendError(res, 'vehicleId, cost, and serviceDate are required', null, 400);
    }

    const logDoc = await VehicleMaintenance.create({
      schoolId,
      vehicleId,
      maintenanceType,
      cost: Number(cost),
      description,
      serviceDate,
      nextServiceDueDate,
      performedBy,
    });

    return sendSuccess(res, 'Vehicle maintenance log added successfully', logDoc, 201);
  } catch (err) {
    next(err);
  }
};
