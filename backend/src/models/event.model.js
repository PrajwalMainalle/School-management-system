import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    eventType: {
      type: String,
      required: true,
      enum: ['HOLIDAY', 'EXAM', 'MEETING', 'SPORTS', 'CULTURAL', 'PROGRAM', 'ACADEMIC', 'FEE_DEADLINE', 'HOMEWORK_DEADLINE', 'ONLINE_CLASS', 'OTHER'],
      default: 'PROGRAM',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    location: { type: String, default: 'School Campus' },
    organizer: { type: String, default: 'School Management' },
    audienceType: {
      type: String,
      enum: ['EVERYONE', 'TEACHERS', 'STAFF', 'STUDENTS', 'CLASS', 'SECTION', 'CUSTOM'],
      default: 'EVERYONE',
    },
    targetClassId: { type: String, default: null },
    targetSectionId: { type: String, default: null },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  },
  { timestamps: true }
);

eventSchema.index({ schoolId: 1, startDate: 1 });

export default mongoose.model('Event', eventSchema);
