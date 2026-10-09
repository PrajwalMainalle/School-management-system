import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema(
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
      type: String, // Ref to AcademicYear
      required: true,
    },
    classId: {
      type: String, // Ref to Class
      required: [true, 'Class reference is required'],
      index: true,
    },
    sectionId: {
      type: String, // Ref to Section
      required: [true, 'Section reference is required'],
      index: true,
    },
    subjectId: {
      type: String, // Ref to Subject
      required: [true, 'Subject reference is required'],
      index: true,
    },
    teacherId: {
      type: String, // Ref to Teacher
      required: [true, 'Teacher reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Homework title is required'],
      trim: true,
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    attachments: [
      {
        name: String,
        url: String, // Cloudinary/S3 URL
        provider: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['ASSIGNED', 'CLOSED'],
      default: 'ASSIGNED',
    },
  },
  { timestamps: true }
);

homeworkSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dueDate: -1 });

const Homework = mongoose.models.Homework || mongoose.model('Homework', homeworkSchema);
export default Homework;
