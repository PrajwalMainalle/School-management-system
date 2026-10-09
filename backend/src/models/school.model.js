import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'School code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    logo: {
      type: String,
      default: '',
    },
    slogan: {
      type: String,
      default: 'Learn • Grow • Protect',
    },
    boardAffiliation: {
      type: String,
      default: 'State Board / CBSE',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const School = mongoose.models.School || mongoose.model('School', schoolSchema);
export default School;
