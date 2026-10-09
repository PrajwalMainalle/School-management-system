import mongoose from 'mongoose';

const vehicleMaintenanceSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    vehicleId: {
      type: String,
      required: true,
    },
    maintenanceType: {
      type: String,
      enum: ['SERVICE', 'REPAIR', 'INSPECTION', 'TIRE_CHANGE', 'OIL_CHANGE'],
      default: 'SERVICE',
    },
    cost: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    serviceDate: {
      type: String,
      required: true,
    },
    nextServiceDueDate: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.VehicleMaintenance || mongoose.model('VehicleMaintenance', vehicleMaintenanceSchema);
