import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        'FEE_STRUCTURE_CREATED',
        'INVOICE_GENERATED',
        'PAYMENT_COLLECTED',
        'PAYMENT_VERIFIED',
        'DISCOUNT_APPLIED',
        'GRADING_SCALE_UPDATED',
        'SYSTEM_CONFIG_UPDATED',
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    entityId: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ schoolId: 1, action: 1, timestamp: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
