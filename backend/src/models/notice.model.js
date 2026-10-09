import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['NORMAL', 'IMPORTANT', 'URGENT'], default: 'NORMAL' },
    audienceType: {
      type: String,
      enum: ['EVERYONE', 'TEACHERS', 'STAFF', 'STUDENTS', 'CLASS', 'SECTION'],
      default: 'EVERYONE',
    },
    targetClassId: { type: String, default: null },
    targetSectionId: { type: String, default: null },
    publishDate: { type: String, required: true },
    expiryDate: { type: String, default: '' },
    authorName: { type: String, default: 'Principal' },
    attachments: [{ name: String, url: String }],
    readBy: [
      {
        userId: String,
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

noticeSchema.index({ schoolId: 1, publishDate: -1 });

export default mongoose.model('Notice', noticeSchema);
