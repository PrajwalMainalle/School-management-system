import mongoose from 'mongoose';

const payrollPayslipSchema = new mongoose.Schema(
  {
    payslipNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    staffId: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: Number, // 1 to 12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalWorkingDays: {
      type: Number,
      default: 26,
    },
    presentDays: {
      type: Number,
      default: 26,
    },
    lopDays: {
      type: Number,
      default: 0,
    },
    basicPay: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    lopDeduction: {
      type: Number,
      default: 0,
    },
    pfDeduction: {
      type: Number,
      default: 0,
    },
    ptDeduction: {
      type: Number,
      default: 0,
    },
    tdsDeduction: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'DISBURSED'],
      default: 'DRAFT',
    },
    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'CHEQUE', 'CASH'],
      default: 'BANK_TRANSFER',
    },
    transactionRef: {
      type: String,
      default: '',
    },
    disbursedAt: Date,
  },
  { timestamps: true }
);

payrollPayslipSchema.index({ schoolId: 1, staffId: 1, month: 1, year: 1 }, { unique: true });

const PayrollPayslip = mongoose.models.PayrollPayslip || mongoose.model('PayrollPayslip', payrollPayslipSchema);
export default PayrollPayslip;
