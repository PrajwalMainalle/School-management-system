import mongoose from 'mongoose';

const feeInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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
    branchId: {
      type: String,
      required: true,
      index: true,
    },
    academicYearId: {
      type: String,
      required: true,
    },
    studentId: {
      type: String, // Ref to Student
      required: true,
      index: true,
    },
    classId: {
      type: String,
      required: true,
    },
    sectionId: {
      type: String,
      required: true,
    },
    feeStructureId: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    netPayable: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'],
      default: 'UNPAID',
    },
  },
  { timestamps: true }
);

feeInvoiceSchema.index({ schoolId: 1, studentId: 1, status: 1 });

const FeeInvoice = mongoose.models.FeeInvoice || mongoose.model('FeeInvoice', feeInvoiceSchema);
export default FeeInvoice;
