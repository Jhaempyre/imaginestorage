import { type ImageFile } from "@/api/files/api";
import { type MediaItem } from "@/stores/media-library.store";


// Helper function to transform VideoFile to MediaItem (reusing ImageFile interface for videos)
export const transformVideoFileToMediaItem = (videoFile: ImageFile): MediaItem => ({
  id: videoFile.id,
  name: videoFile.name,
  originalName: videoFile.name,
  type: "file",
  mimeType: videoFile.mimeType,
  fileSize: videoFile.fileSize,
  isPublic: videoFile.isPublic,
  fullPath: videoFile.fullPath,
  openUrl: videoFile.openUrl,
  downloadUrl: videoFile.downloadUrl,
  previewUrl: videoFile.previewUrl,
  createdAt: videoFile.createdAt,
});