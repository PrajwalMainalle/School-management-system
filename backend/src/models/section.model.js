import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
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
    classId: {
      type: String, // Ref to Class
      required: [true, 'Class reference is required'],
      index: true,
    },
    sectionName: {
      type: String, // e.g. 'Section A'
      required: [true, 'Section name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 40,
    },
    roomNumber: {
      type: String,
      default: '',
    },
    classTeacherId: {
      type: String, // Ref to Teacher User ID
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ schoolId: 1, classId: 1, sectionName: 1 }, { unique: true });

const Section = mongoose.models.Section || mongoose.model('Section', sectionSchema);
export default Section;
