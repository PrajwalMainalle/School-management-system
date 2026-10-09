import mongoose from 'mongoose';

const routeStopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  pickupTime: { type: String, required: true },
  dropTime: { type: String, required: true },
  fareAmount: { type: Number, default: 0 },
  stopOrder: { type: Number, default: 1 },
});

const routeSchema = new mongoose.Schema(
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
    routeName: {
      type: String,
      required: true,
    },
    routeCode: {
      type: String,
      required: true,
    },
    startPoint: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    vehicleId: {
      type: String,
      default: '',
    },
    driverId: {
      type: String,
      default: '',
    },
    stops: [routeStopSchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Route || mongoose.model('Route', routeSchema);
