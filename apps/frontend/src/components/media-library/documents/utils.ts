import { type ImageFile } from "@/api/files/api";
import { type MediaItem } from "@/stores/media-library.store";

// Helper function to transform DocumentFile to MediaItem (reusing ImageFile interface for documents)
export const transformDocumentFileToMediaItem = (documentFile: ImageFile): MediaItem => ({
  id: documentFile.id,
  name: documentFile.name,
  originalName: documentFile.name,
  type: "file",
  mimeType: documentFile.mimeType,
  fileSize: documentFile.fileSize,
  isPublic: documentFile.isPublic,
  fullPath: documentFile.fullPath,
  openUrl: documentFile.openUrl,
  downloadUrl: documentFile.downloadUrl,
  previewUrl: documentFile.previewUrl,
  createdAt: documentFile.createdAt,
});