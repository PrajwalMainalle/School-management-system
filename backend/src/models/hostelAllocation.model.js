import mongoose from 'mongoose';

const hostelAllocationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      default: 'BRANCH_MAIN_CAMPUS',
    },
    academicYearId: {
      type: String,
      default: 'ay_2026_27',
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    hostelId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    bedNumber: {
      type: String,
      required: true,
    },
    monthlyFee: {
      type: Number,
      required: true,
    },
    allocationDate: {
      type: String,
      required: true,
    },
    checkoutDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CHECKED_OUT'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.HostelAllocation || mongoose.model('HostelAllocation', hostelAllocationSchema);
