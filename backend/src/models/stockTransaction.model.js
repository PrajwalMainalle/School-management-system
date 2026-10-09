import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    transactionType: {
      type: String,
      required: true,
      enum: ['PURCHASE', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'LOST', 'CONSUMED'],
    },
    quantity: { type: Number, required: true }, // positive for add, negative for deduction
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    unitPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    issuedToName: { type: String, default: '' }, // Teacher, staff or department receiving item
    issuedToType: { type: String, enum: ['STAFF', 'TEACHER', 'STUDENT', 'DEPARTMENT', 'OTHER'], default: 'STAFF' },
    supplierId: { type: String, default: null },
    referenceNumber: { type: String, default: '' }, // Invoice # or Issue Slip #
    notes: { type: String, default: '' },
    performedBy: { type: String, default: 'System Admin' },
    transactionDate: { type: String, required: true },
  },
  { timestamps: true }
);

stockTransactionSchema.index({ schoolId: 1, itemId: 1 });

export default mongoose.model('StockTransaction', stockTransactionSchema);
