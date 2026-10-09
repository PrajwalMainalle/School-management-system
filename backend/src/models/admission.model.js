import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
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
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
    parentPhone: {
      type: String,
      required: true,
    },
    parentEmail: String,
    seekingClassId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ENQUIRY', 'APPLICATION', 'VERIFICATION', 'APPROVED', 'ADMITTED', 'REJECTED'],
      default: 'ENQUIRY',
    },
    remarks: String,
    allocatedSectionId: String,
    documentsSubmitted: [
      {
        documentType: String, // Birth Certificate, Transfer Certificate, Aadhar
        isVerified: { type: Boolean, default: false },
        url: String,
      },
    ],
  },
  { timestamps: true }
);

admissionSchema.index({ schoolId: 1, status: 1 });

const Admission = mongoose.models.Admission || mongoose.model('Admission', admissionSchema);
export default Admission;
