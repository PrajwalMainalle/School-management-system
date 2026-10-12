import Hostel from '../models/hostel.model.js';
import HostelRoom from '../models/hostelRoom.model.js';
import HostelAllocation from '../models/hostelAllocation.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get Hostels
 */
export const getHostels = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const hostels = await Hostel.find({ schoolId });
    return sendSuccess(res, 'Hostels fetched successfully', hostels);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Hostel
 */
export const addHostel = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const { hostelName, hostelType = 'BOYS', wardenName, wardenPhone, capacity = 100, address = '', status = 'ACTIVE' } = req.body;

    if (!hostelName || !wardenName || !wardenPhone) {
      return sendError(res, 'hostelName, wardenName, and wardenPhone are required', null, 400);
    }

    const existing = await Hostel.findOne({ schoolId, hostelName });
    if (existing) {
      return sendError(res, 'Hostel with this name already exists', null, 400);
    }

    const hostelDoc = await Hostel.create({
      schoolId,
      hostelName,
      hostelType,
      wardenName,
      wardenPhone,
      capacity: Number(capacity),
      address,
      status,
    });

    return sendSuccess(res, 'Hostel building created successfully', hostelDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Rooms
 */
export const getRooms = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const rooms = await HostelRoom.find({ schoolId });
    return sendSuccess(res, 'Hostel rooms fetched successfully', rooms);
  } catch (err) {
    next(err);
  }
};

/**
 * Add Room
 */
export const addRoom = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const { hostelId, buildingName = 'Block A', floorNumber = 1, roomNumber, roomType = 'DOUBLE', capacity = 2, monthlyFee = 3500 } = req.body;

    if (!hostelId || !roomNumber || !capacity) {
      return sendError(res, 'hostelId, roomNumber, and capacity are required', null, 400);
    }

    const existing = await HostelRoom.findOne({ schoolId, hostelId, roomNumber });
    if (existing) {
      return sendError(res, 'Room with this number already exists in this hostel', null, 400);
    }

    const roomDoc = await HostelRoom.create({
      schoolId,
      hostelId,
      buildingName,
      floorNumber: Number(floorNumber),
      roomNumber,
      roomType,
      capacity: Number(capacity),
      monthlyFee: Number(monthlyFee),
      status: 'AVAILABLE',
    });

    return sendSuccess(res, 'Hostel room created successfully', roomDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Allocate Hostel Bed to Student with Business Rule Validation
 */
export const allocateBed = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const {
      studentId,
      hostelId,
      roomId,
      bedNumber,
      monthlyFee = 3500,
      academicYearId = 'AY_2026_27',
      allocationDate = new Date().toISOString().split('T')[0],
    } = req.body;

    if (!studentId || !hostelId || !roomId || !bedNumber) {
      return sendError(res, 'studentId, hostelId, roomId, and bedNumber are required', null, 400);
    }

    const targetRoom = await HostelRoom.findById(roomId);
    if (!targetRoom) {
      return sendError(res, 'Target hostel room not found', null, 404);
    }

    const existingStudentAlloc = await HostelAllocation.findOne({
      schoolId,
      studentId,
      academicYearId,
      status: 'ACTIVE',
    });
    if (existingStudentAlloc) {
      return sendError(res, 'Student already has an active hostel bed allocation', null, 400);
    }

    const existingBedOccupied = await HostelAllocation.findOne({
      schoolId,
      roomId,
      bedNumber,
      status: 'ACTIVE',
    });
    if (existingBedOccupied) {
      return sendError(res, `Bed '${bedNumber}' is already occupied in this room`, null, 400);
    }

    const activeInRoomCount = await HostelAllocation.countDocuments({
      schoolId,
      roomId,
      status: 'ACTIVE',
    });
    if (activeInRoomCount >= targetRoom.capacity) {
      return sendError(res, `Room capacity reached! Maximum capacity is ${targetRoom.capacity} beds.`, null, 400);
    }

    const allocDoc = await HostelAllocation.create({
      schoolId,
      academicYearId,
      studentId,
      hostelId,
      roomId,
      bedNumber,
      monthlyFee: Number(monthlyFee),
      allocationDate,
      status: 'ACTIVE',
    });

    return sendSuccess(res, 'Hostel bed allocated to student successfully', allocDoc, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get Hostel Allocations
 */
export const getAllocations = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const allocs = await HostelAllocation.find({ schoolId });
    return sendSuccess(res, 'Hostel allocations fetched successfully', allocs);
  } catch (err) {
    next(err);
  }
};

/**
 * Checkout Student from Hostel
 */
export const checkoutStudent = async (req, res, next) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const { allocationId } = req.params;

    const alloc = await HostelAllocation.findOneAndUpdate(
      { _id: allocationId, schoolId },
      { status: 'CHECKED_OUT', checkoutDate: new Date().toISOString().split('T')[0] },
      { new: true }
    );
    if (!alloc) return sendError(res, 'Allocation record not found', null, 404);
    return sendSuccess(res, 'Student checked out from hostel successfully', alloc);
  } catch (err) {
    next(err);
  }
};
