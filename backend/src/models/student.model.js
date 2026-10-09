import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
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
      type: String, // Ref to User account
      default: null,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
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
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    emergencyContact: {
      guardianName: String,
      relationship: String,
      phone: String,
      email: String,
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
    academicYearId: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PROMOTED', 'TRANSFERRED', 'GRADUATED', 'INACTIVE'],
      default: 'ACTIVE',
    },
    documents: [
      {
        name: String,
        url: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    previousSchoolDetails: {
      schoolName: String,
      lastGrade: String,
      tcNumber: String,
    },
    academicHistory: [
      {
        academicYear: String,
        className: String,
        sectionName: String,
        gradePercentage: Number,
        promotedDate: Date,
      },
    ],
  },
  { timestamps: true }
);

studentSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });
studentSchema.index({ schoolId: 1, status: 1 });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;
