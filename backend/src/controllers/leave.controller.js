import LeaveRequest from '../models/leaveRequest.model.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const filter = { schoolId };
    if (status) filter.status = status;

    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 'Leave requests fetched', { leaveRequests: leaves });
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

    const schoolId = req.user?.schoolId || 'SCHOOL_MAIN';
    const branchId = req.user?.branchId || 'BRANCH_MAIN_CAMPUS';

    const leave = await LeaveRequest.create({
      schoolId,
      branchId,
      applicantId: req.user?._id,
      applicantName: req.user?.name || 'Staff Member',
      role: req.user?.role || 'TEACHER',
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numberOfDays: Number(numberOfDays) || 1,
      reason,
      status: 'APPLIED',
    });

    return sendSuccess(res, 'Leave application submitted successfully', { leave }, 201);
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

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return sendError(res, 'Leave request not found', null, 404);

    leave.status = status;
    leave.approvedBy = req.user?.name || 'Administrator';
    if (rejectionReason) leave.rejectionReason = rejectionReason;
    await leave.save();

    return sendSuccess(res, `Leave request ${status.toLowerCase()}`, { leave });
  } catch (error) {
    next(error);
  }
};
