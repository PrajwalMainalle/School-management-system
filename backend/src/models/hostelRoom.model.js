import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    hostelId: {
      type: String,
      required: true,
      index: true,
    },
    buildingName: {
      type: String,
      default: 'Block A',
    },
    floorNumber: {
      type: Number,
      default: 1,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'],
      default: 'DOUBLE',
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    monthlyFee: {
      type: Number,
      required: true,
      default: 3500,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'FULL', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.HostelRoom || mongoose.model('HostelRoom', hostelRoomSchema);
