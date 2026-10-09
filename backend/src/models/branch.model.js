import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: [true, 'School ID is required'],
      index: true,
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    branchCode: {
      type: String,
      required: [true, 'Branch code is required'],
      uppercase: true,
      trim: true,
    },
    isMainBranch: {
      type: Boolean,
      default: false,
    },
    phone: String,
    email: String,
    address: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

branchSchema.index({ schoolId: 1, branchCode: 1 }, { unique: true });

const Branch = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
export default Branch;
