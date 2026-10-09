import mongoose from 'mongoose';
import Hostel from '../models/hostel.model.js';
import HostelRoom from '../models/hostelRoom.model.js';
import HostelAllocation from '../models/hostelAllocation.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Dev fallback stores
let mockHostels = [];
let mockRooms = [];
let mockAllocations = [];

/**
 * Get Hostels
 */
export const getHostels = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const hostels = await Hostel.find({ schoolId });
      return sendSuccess(res, 'Hostels fetched successfully', hostels);
    }
    return sendSuccess(res, 'Hostels fetched (Dev Mode)', mockHostels);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Hostel
 */
export const addHostel = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { hostelName, hostelType = 'BOYS', wardenName, wardenPhone, capacity = 100, address = '', status = 'ACTIVE' } = req.body;

    if (!hostelName || !wardenName || !wardenPhone) {
      return sendError(res, 'hostelName, wardenName, and wardenPhone are required', null, 400);
    }

    let hostelDoc;
    if (mongoose.connection.readyState === 1) {
      const existing = await Hostel.findOne({ schoolId, hostelName });
      if (existing) {
        return sendError(res, 'Hostel with this name already exists', null, 400);
      }
      hostelDoc = await Hostel.create({
        schoolId,
        hostelName,
        hostelType,
        wardenName,
        wardenPhone,
        capacity: Number(capacity),
        address,
        status,
      });
    } else {
      const existing = mockHostels.find((h) => h.hostelName === hostelName);
      if (existing) {
        return sendError(res, 'Hostel with this name already exists', null, 400);
      }
      hostelDoc = {
        _id: 'hst_' + Date.now(),
        schoolId,
        hostelName,
        hostelType,
        wardenName,
        wardenPhone,
        capacity: Number(capacity),
        address,
        status,
        createdAt: new Date().toISOString(),
      };
      mockHostels.push(hostelDoc);
    }

    return sendSuccess(res, 'Hostel building created successfully', hostelDoc, 201);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Rooms
 */
export const getRooms = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const rooms = await HostelRoom.find({ schoolId });
      return sendSuccess(res, 'Hostel rooms fetched successfully', rooms);
    }
    return sendSuccess(res, 'Hostel rooms fetched (Dev Mode)', mockRooms);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Add Room
 */
export const addRoom = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { hostelId, buildingName = 'Block A', floorNumber = 1, roomNumber, roomType = 'DOUBLE', capacity = 2, monthlyFee = 3500 } = req.body;

    if (!hostelId || !roomNumber || !capacity) {
      return sendError(res, 'hostelId, roomNumber, and capacity are required', null, 400);
    }

    let roomDoc;
    if (mongoose.connection.readyState === 1) {
      const existing = await HostelRoom.findOne({ schoolId, hostelId, roomNumber });
      if (existing) {
        return sendError(res, 'Room with this number already exists in this hostel', null, 400);
      }
      roomDoc = await HostelRoom.create({
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
    } else {
      const existing = mockRooms.find((r) => r.hostelId === hostelId && r.roomNumber === roomNumber);
      if (existing) {
        return sendError(res, 'Room with this number already exists in this hostel', null, 400);
      }
      roomDoc = {
        _id: 'rm_' + Date.now(),
        schoolId,
        hostelId,
        buildingName,
        floorNumber: Number(floorNumber),
        roomNumber,
        roomType,
        capacity: Number(capacity),
        monthlyFee: Number(monthlyFee),
        status: 'AVAILABLE',
        createdAt: new Date().toISOString(),
      };
      mockRooms.push(roomDoc);
    }

    return sendSuccess(res, 'Hostel room created successfully', roomDoc, 201);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Allocate Hostel Bed to Student with Business Rule Validation
 */
export const allocateBed = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const {
      studentId,
      hostelId,
      roomId,
      bedNumber,
      monthlyFee = 3500,
      academicYearId = 'ay_2026_27',
      allocationDate = new Date().toISOString().split('T')[0],
    } = req.body;

    if (!studentId || !hostelId || !roomId || !bedNumber) {
      return sendError(res, 'studentId, hostelId, roomId, and bedNumber are required', null, 400);
    }

    let targetRoom;
    if (mongoose.connection.readyState === 1) {
      targetRoom = await HostelRoom.findById(roomId);
      if (!targetRoom) {
        return sendError(res, 'Target hostel room not found', null, 404);
      }

      // 1. Prevent Duplicate Active Allocation for Student
      const existingStudentAlloc = await HostelAllocation.findOne({
        schoolId,
        studentId,
        academicYearId,
        status: 'ACTIVE',
      });
      if (existingStudentAlloc) {
        return sendError(res, 'Student already has an active hostel bed allocation', null, 400);
      }

      // 2. Prevent Occupied Bed Double-Allocation
      const existingBedOccupied = await HostelAllocation.findOne({
        schoolId,
        roomId,
        bedNumber,
        status: 'ACTIVE',
      });
      if (existingBedOccupied) {
        return sendError(res, `Bed '${bedNumber}' is already occupied in this room`, null, 400);
      }

      // 3. Prevent Room Over-Capacity
      const activeInRoomCount = await HostelAllocation.countDocuments({
        schoolId,
        roomId,
        status: 'ACTIVE',
      });
      if (activeInRoomCount >= targetRoom.capacity) {
        return sendError(res, `Room capacity reached! Maximum capacity is ${targetRoom.capacity} beds.`, null, 400);
      }

      // Create Allocation
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
    } else {
      // Dev In-Memory Mode
      targetRoom = mockRooms.find((r) => r._id === roomId || r.roomNumber === roomId);

      const existingStudentAlloc = mockAllocations.find(
        (a) => a.studentId === studentId && a.status === 'ACTIVE'
      );
      if (existingStudentAlloc) {
        return sendError(res, 'Student already has an active hostel bed allocation', null, 400);
      }

      const existingBedOccupied = mockAllocations.find(
        (a) => a.roomId === roomId && a.bedNumber === bedNumber && a.status === 'ACTIVE'
      );
      if (existingBedOccupied) {
        return sendError(res, `Bed '${bedNumber}' is already occupied in this room`, null, 400);
      }

      if (targetRoom) {
        const activeInRoomCount = mockAllocations.filter(
          (a) => a.roomId === roomId && a.status === 'ACTIVE'
        ).length;
        if (activeInRoomCount >= targetRoom.capacity) {
          return sendError(res, `Room capacity reached! Maximum capacity is ${targetRoom.capacity} beds.`, null, 400);
        }
      }

      const allocDoc = {
        _id: 'ha_' + Date.now(),
        schoolId,
        academicYearId,
        studentId,
        hostelId,
        roomId,
        bedNumber,
        monthlyFee: Number(monthlyFee),
        allocationDate,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      mockAllocations.push(allocDoc);

      return sendSuccess(res, 'Hostel bed allocated to student successfully (Dev Mode)', allocDoc, 201);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Get Hostel Allocations
 */
export const getAllocations = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    if (mongoose.connection.readyState === 1) {
      const allocs = await HostelAllocation.find({ schoolId });
      return sendSuccess(res, 'Hostel allocations fetched successfully', allocs);
    }
    return sendSuccess(res, 'Hostel allocations fetched (Dev Mode)', mockAllocations);
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};

/**
 * Checkout Student from Hostel
 */
export const checkoutStudent = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId || 'SCHOOL_GREENWOOD_MAIN';
    const { allocationId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const alloc = await HostelAllocation.findOneAndUpdate(
        { _id: allocationId, schoolId },
        { status: 'CHECKED_OUT', checkoutDate: new Date().toISOString().split('T')[0] },
        { new: true }
      );
      if (!alloc) return sendError(res, 'Allocation record not found', null, 404);
      return sendSuccess(res, 'Student checked out from hostel successfully', alloc);
    } else {
      const alloc = mockAllocations.find((a) => a._id === allocationId);
      if (!alloc) return sendError(res, 'Allocation record not found', null, 404);
      alloc.status = 'CHECKED_OUT';
      alloc.checkoutDate = new Date().toISOString().split('T')[0];
      return sendSuccess(res, 'Student checked out from hostel successfully (Dev Mode)', alloc);
    }
  } catch (err) {
    return sendError(res, err.message, null, 500);
  }
};
