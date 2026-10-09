import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
    },
    applicantId: {
      type: String, // User ID or Staff/Teacher/Student ID
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'MATERNITY_LEAVE', 'UNPAID_LEAVE'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'APPROVED', 'REJECTED'],
      default: 'APPLIED',
    },
    approvedBy: {
      type: String,
      default: null,
    },
    rejectionReason: String,
  },
  { timestamps: true }
);

leaveRequestSchema.index({ schoolId: 1, status: 1 });

const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
