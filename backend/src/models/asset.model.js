import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    assetCode: { type: String, required: true, trim: true },
    assetName: { type: String, required: true, trim: true },
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
    serialNumber: { type: String, default: '' },
    purchaseDate: { type: String, required: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    vendorName: { type: String, default: '' },
    warrantyExpiry: { type: String, default: '' },
    location: { type: String, default: 'Main Office' },
    condition: {
      type: String,
      enum: ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'REPAIRED'],
      default: 'NEW',
    },
    status: {
      type: String,
      enum: ['PURCHASED', 'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETURNED', 'DISPOSED'],
      default: 'AVAILABLE',
    },
    assignedToName: { type: String, default: '' },
    assignedDepartment: { type: String, default: '' },
    assignmentDate: { type: String, default: '' },
    maintenanceNotes: [{ date: String, note: String, cost: Number, performedBy: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

assetSchema.index({ schoolId: 1, assetCode: 1 }, { unique: true });

export default mongoose.model('Asset', assetSchema);
