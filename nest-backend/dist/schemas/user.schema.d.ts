import { Document } from 'mongoose';
export type UserDocument = User & Document & {
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateEmailVerificationToken(): string;
    generatePasswordResetToken(): string;
};
export declare class User {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    avatar: string;
    isEmailVerified: boolean;
    emailVerificationToken: string;
    emailVerificationExpiry: Date;
    passwordResetToken: string;
    passwordResetExpiry: Date;
    refreshToken: string;
    isActive: boolean;
    lastLoginAt: Date;
    isOnboardingComplete: boolean;
    onboardingCompletedAt: Date;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
