// // Re-export the new storage manager and interfaces
export { storageManager } from './StorageManager';
export { StorageManager } from './StorageManager';
export type { IStorageProvider, UploadParams, UploadResult, DownloadUrlParams, DeleteParams } from './interfaces/IStorageProvider';
// export type { SupportedProviders, ProviderConfig } from './StorageManager';

// // Legacy compatibility - will be deprecated
// import { storageManager } from './StorageManager';

// export const storageService = {
//   async uploadFile(params: { filePath: string; fileName: string; userId: string; mimeType: string; fileSize: number }) {
//     const result = await storageManager.uploadFile(params);
//     return {
//       storageLocation: result.storageLocation,
//       storageProvider: storageManager.getActiveProvider().type,
//       fileName: result.fileName
//     };
//   },
  
//   async getFileUrl(params: { fileName: string; expiresIn?: number }) {
//     return storageManager.getDownloadUrl({
//       fileName: params.fileName,
//       expiresIn: params.expiresIn,
//       userId: '' // Will be handled by the provider
//     });
//   },
  
//   async deleteFile(params: { fileName: string }) {
//     return storageManager.deleteFile({
//       fileName: params.fileName,
//       userId: '' // Will be handled by the provider
//     });
//   }
// };