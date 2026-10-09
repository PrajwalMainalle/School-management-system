import mongoose from 'mongoose';

const transportAssignmentSchema = new mongoose.Schema(
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
    routeId: {
      type: String,
      required: true,
    },
    pickupStopName: {
      type: String,
      required: true,
    },
    dropStopName: {
      type: String,
      required: true,
    },
    monthlyFare: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CANCELLED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.TransportAssignment || mongoose.model('TransportAssignment', transportAssignmentSchema);
