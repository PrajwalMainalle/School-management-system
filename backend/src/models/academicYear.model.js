import mongoose from 'mongoose';

const academicYearSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    yearName: {
      type: String, // e.g., '2026-27'
      required: [true, 'Academic year name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

academicYearSchema.index({ schoolId: 1, yearName: 1 }, { unique: true });

const AcademicYear = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema);
export default AcademicYear;
