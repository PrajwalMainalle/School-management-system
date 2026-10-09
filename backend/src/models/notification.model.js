import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    userId: { type: String, required: true, index: true }, // User ID or 'ALL'
    role: { type: String, default: 'ALL' },
    category: {
      type: String,
      required: true,
      enum: [
        'ATTENDANCE',
        'FEES',
        'PAYMENT',
        'EXAMS',
        'RESULTS',
        'HOMEWORK',
        'ASSIGNMENTS',
        'NOTICES',
        'MEETINGS',
        'EVENTS',
        'LEAVE',
        'TRANSPORT',
        'LIBRARY',
        'PAYROLL',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ schoolId: 1, userId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
