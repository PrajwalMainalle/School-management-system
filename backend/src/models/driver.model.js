import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
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
    driverId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    licenseCategory: {
      type: String,
      enum: ['HEAVY_MOTOR_VEHICLE', 'LIGHT_MOTOR_VEHICLE', 'COMMERCIAL'],
      default: 'HEAVY_MOTOR_VEHICLE',
    },
    licenseExpiry: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: String,
      default: '',
    },
    assignedVehicleId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
