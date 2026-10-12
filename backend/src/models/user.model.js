import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude password from query results by default
    },
    role: {
      type: String,
      enum: {
        values: [
          'ORGANIZER',
          'SUPER_ADMIN',
          'ADMIN',
          'TEACHER',
          'NON_TEACHING_STAFF',
          'STUDENT',
        ],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'STUDENT',
    },
    permissions: {
      type: [String],
      default: [],
    },
    languagePreference: {
      type: String,
      enum: ['en', 'kn'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schoolId: {
      type: String,
      default: 'SCHOOL_MAIN',
      index: true,
    },
    branchId: {
      type: String,
      default: 'BRANCH_MAIN',
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Index for multi-tenant querying
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, branchId: 1 });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output JSON to omit sensitive details
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.passwordResetToken;
  delete userObj.passwordResetExpires;
  delete userObj.__v;
  return userObj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
