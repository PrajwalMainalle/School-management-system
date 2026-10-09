import mongoose from 'mongoose';
import LeaveRequest from '../models/leaveRequest.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const mockLeaves = [
  {
    _id: 'lv_1',
    applicantId: 'usr_teacher',
    applicantName: 'Anita Sharma',
    role: 'TEACHER',
    leaveType: 'CASUAL_LEAVE',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    numberOfDays: 2,
    reason: 'Family function attendance',
    status: 'APPLIED',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
  {
    _id: 'lv_2',
    applicantId: 'stf_101',
    applicantName: 'Vijay Gowda',
    role: 'NON_TEACHING_STAFF',
    leaveType: 'SICK_LEAVE',
    startDate: '2026-10-01',
    endDate: '2026-10-02',
    numberOfDays: 2,
    reason: 'Fever and rest',
    status: 'APPROVED',
    approvedBy: 'superadmin',
    schoolId: 'SCHOOL_GREENWOOD_MAIN',
    branchId: 'BRANCH_MAIN_CAMPUS',
  },
];

export const getLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    if (mongoose.connection.readyState === 1) {
      const filter = { schoolId: req.user.schoolId };
      if (status) filter.status = status;
      const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
      return sendSuccess(res, 'Leave requests fetched', { leaveRequests: leaves });
    } else {
      let filtered = [...mockLeaves];
      if (status) filtered = filtered.filter((l) => l.status === status);
      return sendSuccess(res, 'Leave requests fetched (Dev Mode)', { leaveRequests: filtered });
    }
  } catch (error) {
    next(error);
  }
};

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, numberOfDays, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return sendError(res, 'Leave type, start date, end date, and reason are required', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.create({
        schoolId: req.user.schoolId,
        branchId: req.user.branchId,
        applicantId: req.user._id,
        applicantName: req.user.name,
        role: req.user.role,
        leaveType,
        startDate,
        endDate,
        numberOfDays: Number(numberOfDays) || 1,
        reason,
        status: 'APPLIED',
      });
      return sendSuccess(res, 'Leave application submitted successfully', { leave }, 201);
    } else {
      const leave = {
        _id: 'lv_' + Date.now(),
        applicantId: req.user._id,
        applicantName: req.user.name || 'Staff Member',
        role: req.user.role || 'TEACHER',
        leaveType,
        startDate,
        endDate,
        numberOfDays: Number(numberOfDays) || 1,
        reason,
        status: 'APPLIED',
        schoolId: req.user.schoolId || 'SCHOOL_GREENWOOD_MAIN',
        branchId: req.user.branchId || 'BRANCH_MAIN_CAMPUS',
      };
      mockLeaves.unshift(leave);
      return sendSuccess(res, 'Leave application submitted (Dev Mode)', { leave }, 201);
    }
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const leaveId = req.params.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return sendError(res, 'Status must be APPROVED or REJECTED', null, 400);
    }

    if (mongoose.connection.readyState === 1) {
      const leave = await LeaveRequest.findById(leaveId);
      if (!leave) return sendError(res, 'Leave request not found', null, 404);
      leave.status = status;
      leave.approvedBy = req.user.name;
      if (rejectionReason) leave.rejectionReason = rejectionReason;
      await leave.save();
      return sendSuccess(res, `Leave request ${status.toLowerCase()}`, { leave });
    } else {
      const lv = mockLeaves.find((l) => l._id === leaveId);
      if (!lv) return sendError(res, 'Leave request not found', null, 404);
      lv.status = status;
      lv.approvedBy = req.user.name;
      if (rejectionReason) lv.rejectionReason = rejectionReason;
      return sendSuccess(res, `Leave request ${status.toLowerCase()} (Dev Mode)`, { leave: lv });
    }
  } catch (error) {
    next(error);
  }
};
