import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
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
      type: String, // Ref to User login account
      default: null,
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
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
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ['ACCOUNTING', 'LIBRARY', 'RECEPTION', 'TRANSPORT', 'HOSTEL', 'INVENTORY', 'SECURITY', 'SUPPORT'],
      required: true,
    },
    designation: {
      type: String, // e.g. Chief Accountant, Head Librarian, Bus Driver
      required: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    permissions: [String], // Granular permission keys
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

staffSchema.index({ schoolId: 1, department: 1 });

const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
export default Staff;
