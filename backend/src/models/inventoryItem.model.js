import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    itemName: { type: String, required: true, trim: true },
    itemCode: { type: String, required: true, trim: true }, // SKU
    category: {
      type: String,
      required: true,
      enum: [
        'STATIONERY',
        'FURNITURE',
        'COMPUTERS',
        'LABORATORY',
        'SPORTS',
        'CLASSROOM',
        'ELECTRICAL',
        'CLEANING',
        'LIBRARY',
        'TRANSPORT',
        'HOSTEL',
        'OTHER',
      ],
      default: 'OTHER',
    },
    unit: { type: String, required: true, default: 'pcs' }, // pcs, kg, box, packet, set, roll, bottle
    openingStock: { type: Number, default: 0, min: 0 },
    currentStock: { type: Number, default: 0, min: 0 },
    minimumStock: { type: Number, default: 5, min: 0 }, // Low-stock threshold
    reorderLevel: { type: Number, default: 10, min: 0 },
    unitPrice: { type: Number, default: 0, min: 0 },
    supplierId: { type: String, default: null },
    supplierName: { type: String, default: '' },
    location: { type: String, default: 'Main Store' }, // Storage location/room
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ schoolId: 1, itemCode: 1 }, { unique: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
