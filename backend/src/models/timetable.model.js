import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
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
    classId: {
      type: String,
      required: true,
      index: true,
    },
    sectionId: {
      type: String,
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "09:45"
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes to assist fast conflict detection
timetableSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });
timetableSchema.index({ schoolId: 1, teacherId: 1, dayOfWeek: 1, periodNumber: 1 });
timetableSchema.index({ schoolId: 1, roomNumber: 1, dayOfWeek: 1, periodNumber: 1 });

const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
export default Timetable;
