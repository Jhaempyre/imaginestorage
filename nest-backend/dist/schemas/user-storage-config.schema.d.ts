import { Document, Types } from 'mongoose';
import { StorageProvider } from '../common/constants/storage.constants';
import { StorageCredentials } from '../common/interfaces/storage.interface';
export type UserStorageConfigDocument = UserStorageConfig & Document;
export declare class UserStorageConfig {
    userId: Types.ObjectId;
    provider: StorageProvider;
    credentials: StorageCredentials;
    isValidated: boolean;
    lastValidatedAt: Date;
    validationError: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserStorageConfigSchema: import("mongoose").Schema<UserStorageConfig, import("mongoose").Model<UserStorageConfig, any, any, any, Document<unknown, any, UserStorageConfig> & UserStorageConfig & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserStorageConfig, Document<unknown, {}, import("mongoose").FlatRecord<UserStorageConfig>> & import("mongoose").FlatRecord<UserStorageConfig> & {
    _id: Types.ObjectId;
}>;
