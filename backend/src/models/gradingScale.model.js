import mongoose from 'mongoose';

const gradeBoundarySchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
  },
  minPercentage: {
    type: Number,
    required: true,
  },
  maxPercentage: {
    type: Number,
    required: true,
  },
  gradePoint: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: '',
  },
});

const gradingScaleSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Grading scale name is required'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    passingPercentage: {
      type: Number,
      default: 35,
    },
    boundaries: [gradeBoundarySchema],
  },
  { timestamps: true }
);

gradingScaleSchema.index({ schoolId: 1, name: 1 }, { unique: true });

const GradingScale = mongoose.models.GradingScale || mongoose.model('GradingScale', gradingScaleSchema);
export default GradingScale;
