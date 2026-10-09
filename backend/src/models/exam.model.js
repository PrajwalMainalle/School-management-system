import mongoose from 'mongoose';

const examSubjectSchema = new mongoose.Schema({
  subjectId: {
    type: String, // Ref to Subject
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 35,
  },
  examDate: Date,
});

const examSchema = new mongoose.Schema(
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
      required: [true, 'Exam name is required'],
      trim: true,
    },
    examType: {
      type: String,
      enum: ['FORMATIVE', 'SUMMATIVE', 'MID_TERM', 'FINAL', 'UNIT_TEST'],
      default: 'MID_TERM',
    },
    classId: {
      type: String,
      required: [true, 'Class reference is required'],
      index: true,
    },
    sectionId: {
      type: String,
      required: [true, 'Section reference is required'],
      index: true,
    },
    gradingScaleId: {
      type: String, // Ref to GradingScale
      default: null,
    },
    subjects: [examSubjectSchema],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['SCHEDULED', 'MARKS_ENTRY', 'CALCULATED', 'PUBLISHED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

examSchema.index({ schoolId: 1, classId: 1, sectionId: 1, academicYearId: 1 });

const Exam = mongoose.models.Exam || mongoose.model('Exam', examSchema);
export default Exam;
