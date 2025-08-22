import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): boolean;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  // toJSON: {
  //   transform: function(doc, ret) {
  //     delete ret.password;
  //     delete ret.emailVerificationToken;
  //     delete ret.passwordResetToken;
  //     delete ret.passwordResetExpires;
  //     delete ret.refreshToken;
  //     return ret;
  //   }
  // }
}
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  try {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    // Hash password with salt using pbkdf2
    const hash = crypto.pbkdf2Sync(this.password, salt, 10000, 64, 'sha512').toString('hex');
    // Store salt + hash
    this.password = salt + ':' + hash;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = function (candidatePassword: string): boolean {
  try {
    // Split stored password into salt and hash
    const [salt, storedHash] = this.password.split(':');
    // Hash the candidate password with the same salt
    const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, 10000, 64, 'sha512').toString('hex');
    // Compare hashes using crypto.timingSafeEqual for security
    return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
  } catch (error) {
    return false;
  }
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  return token;
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

export const User = mongoose.model<IUser>('User', userSchema);