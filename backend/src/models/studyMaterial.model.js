import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
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
      required: [true, 'Class reference is required'],
      index: true,
    },
    sectionId: {
      type: String,
      default: '', // can be for all sections of a class if empty
      index: true,
    },
    subjectId: {
      type: String,
      required: [true, 'Subject reference is required'],
      index: true,
    },
    uploadedBy: {
      type: String, // Ref to Teacher/User ID
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['SYLLABUS', 'NOTES', 'PREVIOUS_PAPER', 'REFERENCE', 'OTHER'],
      default: 'NOTES',
    },
    attachments: [
      {
        name: String,
        url: String, // Cloudinary/S3 URL
        provider: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

studyMaterialSchema.index({ schoolId: 1, classId: 1, subjectId: 1 });

const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
