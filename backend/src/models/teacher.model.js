import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
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
    userId: {
      type: String, // Ref to User login account
      default: null,
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    qualification: {
      type: String, // e.g. M.Sc Mathematics, B.Ed
      required: true,
    },
    specialization: String, // e.g. Mathematics, Kannada Literature
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    assignedClasses: [
      {
        classId: String,
        sectionId: String,
        isClassTeacher: { type: Boolean, default: false },
      },
    ],
    assignedSubjects: [
      {
        classId: String,
        subjectId: String,
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

teacherSchema.index({ schoolId: 1, status: 1 });

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
export default Teacher;
