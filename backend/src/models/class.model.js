import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
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
    className: {
      type: String, // e.g. 'Class 1', 'Class 10'
      required: [true, 'Class name is required'],
      trim: true,
    },
    classCode: {
      type: String, // e.g. 'CLS-10'
      required: [true, 'Class code is required'],
      trim: true,
    },
    numericLevel: {
      type: Number, // 1 to 12 for sorting
      required: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, branchId: 1, classCode: 1 }, { unique: true });

const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
export default Class;
