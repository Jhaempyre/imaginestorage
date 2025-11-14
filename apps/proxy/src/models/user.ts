// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  isActive: boolean;
  deletedAt?: Date;

  comparePassword(password: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
