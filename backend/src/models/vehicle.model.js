import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
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
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['BUS', 'VAN', 'MINI_BUS', 'CAR'],
      default: 'BUS',
    },
    model: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    registrationDetails: {
      type: String,
      default: '',
    },
    insuranceNumber: {
      type: String,
      default: '',
    },
    insuranceExpiry: {
      type: String,
      default: '',
    },
    fitnessExpiry: {
      type: String,
      default: '',
    },
    pollutionCertificateExpiry: {
      type: String,
      default: '',
    },
    permitExpiry: {
      type: String,
      default: '',
    },
    assignedDriverId: {
      type: String,
      default: '',
    },
    assignedHelperName: {
      type: String,
      default: '',
    },
    assignedHelperPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
