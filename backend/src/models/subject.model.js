import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
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
    classId: {
      type: String,
      required: true,
      index: true,
    },
    subjectName: {
      type: String, // e.g. 'Mathematics', 'Kannada'
      required: [true, 'Subject name is required'],
      trim: true,
    },
    subjectCode: {
      type: String, // e.g. 'MATH101'
      required: [true, 'Subject code is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['THEORY', 'PRACTICAL', 'BOTH'],
      default: 'THEORY',
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    passingMarks: {
      type: Number,
      default: 35,
    },
    subjectTeacherId: {
      type: String, // Ref to Teacher User ID
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, classId: 1, subjectCode: 1 }, { unique: true });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;
