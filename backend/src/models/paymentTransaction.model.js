import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionRef: {
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
    invoiceId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'RAZORPAY', 'UPI', 'BANK_TRANSFER', 'CHEQUE'],
      required: true,
    },
    gatewayOrderId: {
      type: String,
      default: '',
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'SUCCESS',
    },
    collectedBy: {
      type: String, // Ref to Staff/User ID
    },
    receiptNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentTransactionSchema.index({ schoolId: 1, invoiceId: 1 });

const PaymentTransaction = mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', paymentTransactionSchema);
export default PaymentTransaction;
