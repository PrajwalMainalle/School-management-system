import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    schoolId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, default: 'GLOBAL', index: true },
    supplierName: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true, default: '' },
    contactPerson: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    address: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    categories: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

supplierSchema.index({ schoolId: 1, supplierName: 1 });

export default mongoose.model('Supplier', supplierSchema);
