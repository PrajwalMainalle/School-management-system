import mongoose from 'mongoose';

const subjectResultSchema = new mongoose.Schema({
  subjectId: String,
  subjectName: String,
  marksObtained: Number,
  maxMarks: Number,
  grade: String,
  gradePoint: Number,
  isAbsent: Boolean,
  isPassed: Boolean,
});

const reportCardSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    examId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    classId: {
      type: String,
      required: true,
    },
    sectionId: {
      type: String,
      required: true,
    },
    totalObtained: {
      type: Number,
      required: true,
    },
    totalMax: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      required: true,
    },
    gpa: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PASSED', 'FAILED', 'NEEDS_IMPROVEMENT'],
      required: true,
    },
    classRank: {
      type: Number,
      default: 0,
    },
    subjectResults: [subjectResultSchema],
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

reportCardSchema.index({ examId: 1, studentId: 1 }, { unique: true });
reportCardSchema.index({ examId: 1, classRank: 1 });

const ReportCard = mongoose.models.ReportCard || mongoose.model('ReportCard', reportCardSchema);
export default ReportCard;
