import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    staffId: {
      type: String, // Ref to Teacher/Staff ID
      required: true,
      unique: true,
      index: true,
    },
    basicPay: {
      type: Number,
      required: [true, 'Basic pay is required'],
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    transportAllowance: {
      type: Number,
      default: 0,
    },
    medicalAllowance: {
      type: Number,
      default: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
    },
    pfPercentage: {
      type: Number,
      default: 12, // Standard 12% PF
    },
    professionalTax: {
      type: Number,
      default: 200, // Standard PT
    },
    tdsAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const SalaryStructure = mongoose.models.SalaryStructure || mongoose.model('SalaryStructure', salaryStructureSchema);
export default SalaryStructure;
