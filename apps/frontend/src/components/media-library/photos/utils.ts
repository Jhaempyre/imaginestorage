import { type ImageFile } from "@/api/files/api";
import { type MediaItem } from "@/stores/media-library.store";


// Helper function to transform ImageFile to MediaItem
export const transformImageFileToMediaItem = (imageFile: ImageFile): MediaItem => ({
  id: imageFile.id,
  name: imageFile.name,
  originalName: imageFile.name,
  type: "file",
  mimeType: imageFile.mimeType,
  fileSize: imageFile.fileSize,
  isPublic: imageFile.isPublic,
  fullPath: imageFile.fullPath,
  openUrl: imageFile.openUrl,
  downloadUrl: imageFile.downloadUrl,
  previewUrl: imageFile.previewUrl,
  createdAt: imageFile.createdAt,
});