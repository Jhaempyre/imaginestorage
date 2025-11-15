import { Document, Types } from 'mongoose';
export type FileDocument = File & Document & {
    generateShareToken(expiryHours?: number): string;
    isShareTokenValid(): boolean;
};
export declare class File {
    userId: Types.ObjectId;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileExtension: string;
    thumbnailPath: string;
    isPublic: boolean;
    shareToken: string;
    shareExpiry: Date;
    metadata: Record<string, any>;
    storageProvider: string;
    storageLocation: string;
    isEncrypted: boolean;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FileSchema: import("mongoose").Schema<File, import("mongoose").Model<File, any, any, any, Document<unknown, any, File> & File & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, File, Document<unknown, {}, import("mongoose").FlatRecord<File>> & import("mongoose").FlatRecord<File> & {
    _id: Types.ObjectId;
}>;
