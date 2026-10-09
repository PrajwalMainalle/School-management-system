import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    homeworkId: {
      type: String, // Ref to Homework
      required: true,
      index: true,
    },
    studentId: {
      type: String, // Ref to Student
      required: true,
      index: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    submissionText: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: String,
        url: String, // Cloudinary/S3 URL
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'EVALUATED', 'LATE'],
      default: 'SUBMITTED',
    },
    grade: {
      type: String, // e.g., 'A+', '88/100'
      default: null,
    },
    teacherFeedback: {
      type: String,
      default: '',
    },
    evaluatedBy: {
      type: String, // Ref to Teacher ID
      default: null,
    },
    evaluatedAt: Date,
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
export default AssignmentSubmission;
