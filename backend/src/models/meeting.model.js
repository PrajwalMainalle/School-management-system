import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    organizerId: { type: String, required: true },
    organizerName: { type: String, required: true },
    organizerRole: { type: String, default: 'TEACHER' },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingType: {
      type: String,
      required: true,
      enum: [
        'ALL_SCHOOL',
        'STAFF',
        'TEACHERS',
        'NON_TEACHING_STAFF',
        'CLASS',
        'SECTION',
        'SUBJECT',
        'STUDENTS',
        'INDIVIDUAL',
        'CUSTOM_GROUP',
      ],
      default: 'CLASS',
    },
    targetClassId: { type: String, default: null },
    targetSectionId: { type: String, default: null },
    subjectId: { type: String, default: null },
    roomCode: { type: String, required: true, unique: true },
    roomToken: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    status: { type: String, enum: ['SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED'], default: 'SCHEDULED' },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    participants: [
      {
        userId: String,
        userName: String,
        role: String,
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date, default: null },
      },
    ],
    chatMessages: [
      {
        senderId: String,
        senderName: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, default: '' },
    decisions: [{ type: String }],
    actionItems: [{ item: String, assignedTo: String, status: { type: String, default: 'PENDING' } }],
  },
  { timestamps: true }
);

meetingSchema.index({ schoolId: 1, scheduledDate: 1, status: 1 });

export default mongoose.model('Meeting', meetingSchema);
