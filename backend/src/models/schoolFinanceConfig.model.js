import mongoose from 'mongoose';

const schoolFinanceConfigSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayKeyId: {
      type: String,
      default: function () {
        return process.env.RAZORPAY_KEY_ID || '';
      },
    },
    upiVpa: {
      type: String,
      default: function () {
        return process.env.SCHOOL_UPI_VPA || '';
      },
    },
    bankName: {
      type: String,
      default: function () {
        return process.env.SCHOOL_BANK_NAME || '';
      },
    },
    bankAccountNo: {
      type: String,
      default: function () {
        return process.env.SCHOOL_BANK_ACCOUNT_NO || '';
      },
    },
    bankIfsc: {
      type: String,
      default: function () {
        return process.env.SCHOOL_BANK_IFSC || '';
      },
    },
    currency: {
      type: String,
      default: 'INR',
    },
    taxRatePercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const SchoolFinanceConfig = mongoose.models.SchoolFinanceConfig || mongoose.model('SchoolFinanceConfig', schoolFinanceConfigSchema);
export default SchoolFinanceConfig;
