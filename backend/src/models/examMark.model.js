import mongoose from 'mongoose';

const examMarkSchema = new mongoose.Schema(
  {
    examId: {
      type: String, // Ref to Exam
      required: true,
      index: true,
    },
    studentId: {
      type: String, // Ref to Student
      required: true,
      index: true,
    },
    subjectId: {
      type: String, // Ref to Subject
      required: true,
      index: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    teacherComments: {
      type: String,
      default: '',
    },
    enteredBy: {
      type: String, // Ref to Teacher/User ID
    },
  },
  { timestamps: true }
);

examMarkSchema.index({ examId: 1, studentId: 1, subjectId: 1 }, { unique: true });

const ExamMark = mongoose.models.ExamMark || mongoose.model('ExamMark', examMarkSchema);
export default ExamMark;
