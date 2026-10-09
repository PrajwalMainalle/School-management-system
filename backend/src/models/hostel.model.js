import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema(
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
    hostelName: {
      type: String,
      required: true,
    },
    hostelType: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'CO_ED'],
      default: 'BOYS',
    },
    wardenName: {
      type: String,
      required: true,
    },
    wardenPhone: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    address: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);
