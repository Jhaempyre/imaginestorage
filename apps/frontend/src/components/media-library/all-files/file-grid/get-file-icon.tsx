import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
} from "lucide-react";

import { type MediaItem } from "@/stores/media-library.store";

export const getFileIcon = (item: MediaItem) => {
  if (item.type === "folder") {
    return <FolderIcon className="w-8 h-8 text-blue-500" />;
  }

  // Determine file type by extension or mime type
  const fileName = item.originalName || item.name;
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return <ImageIcon className="w-8 h-8 text-green-500" />;
  }

  if (["mp4", "avi", "mov", "wmv", "flv"].includes(extension || "")) {
    return <VideoIcon className="w-8 h-8 text-purple-500" />;
  }

  if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension || "")) {
    return <FileTextIcon className="w-8 h-8 text-red-500" />;
  }

  return <FileIcon className="w-8 h-8 text-gray-500" />;
};
