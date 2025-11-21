import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FileCodeIcon,
  FileMusicIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
} from "lucide-react";

import { type MediaItem } from "@/stores/media-library.store";

export const getFileIcon = (item: MediaItem, size: "sm" | "md" | "lg" = "lg") => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5", 
    lg: "w-8 h-8"
  };

  const iconSize = sizeClasses[size];

  if (item.type === "folder") {
    return <FolderIcon className={`${iconSize} text-blue-500`} />;
  }

  // Determine file type by extension or mime type
  const fileName = item.originalName || item.name;
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Images
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(extension || "")) {
    return <ImageIcon className={`${iconSize} text-green-500`} />;
  }

  // Videos  
  if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(extension || "")) {
    return <VideoIcon className={`${iconSize} text-purple-500`} />;
  }

  // Audio
  if (["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(extension || "")) {
    return <FileMusicIcon className={`${iconSize} text-pink-500`} />;
  }

  // Documents
  if (["pdf"].includes(extension || "")) {
    return <FileTextIcon className={`${iconSize} text-red-600`} />;
  }

  if (["doc", "docx", "txt", "rtf", "odt"].includes(extension || "")) {
    return <FileTextIcon className={`${iconSize} text-blue-600`} />;
  }

  // Spreadsheets
  if (["xls", "xlsx", "csv", "ods"].includes(extension || "")) {
    return <FileSpreadsheetIcon className={`${iconSize} text-green-600`} />;
  }

  // Code files
  if (["js", "ts", "jsx", "tsx", "html", "css", "scss", "json", "xml", "py", "php", "java", "cpp", "c", "rb", "go", "rs"].includes(extension || "")) {
    return <FileCodeIcon className={`${iconSize} text-orange-500`} />;
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || "")) {
    return <FileArchiveIcon className={`${iconSize} text-amber-500`} />;
  }

  return <FileIcon className={`${iconSize} text-gray-500`} />;
};
