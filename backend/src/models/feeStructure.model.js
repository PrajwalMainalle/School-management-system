import mongoose from 'mongoose';

const feeHeadSchema = new mongoose.Schema({
  headName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isOptional: {
    type: Boolean,
    default: false,
  },
});

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    branchId: {
      type: String,
      required: true,
      index: true,
    },
    academicYearId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
    },
    classId: {
      type: String,
      required: [true, 'Class reference is required'],
      index: true,
    },
    feeHeads: [feeHeadSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lateFinePerDay: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

feeStructureSchema.index({ schoolId: 1, classId: 1, academicYearId: 1 });

const FeeStructure = mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);
export default FeeStructure;
