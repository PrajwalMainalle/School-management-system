import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    userType: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'STAFF'],
      required: true,
    },
    entityId: {
      type: String, // Ref to Student ID, Teacher ID, or Staff ID
      required: true,
      index: true,
    },
    classId: {
      type: String,
      default: null,
      index: true,
    },
    sectionId: {
      type: String,
      default: null,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'],
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: String, // Ref to User ID who recorded attendance
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ schoolId: 1, entityId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
