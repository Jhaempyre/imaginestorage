import { type MediaItem } from "@/stores/media-library.store";
import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { MediaCardContextMenu } from "../shared/media-card-context-menu";

interface DocumentCardProps {
  document: MediaItem;
  onClick: () => void;
}

const getDocumentIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return FileTextIcon;
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return FileSpreadsheetIcon;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return LayoutDashboard;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return FileTextIcon;
  return FileIcon;
};

const getDocumentColor = (mimeType: string) => {
  if (mimeType.includes("pdf")) return "text-red-500 bg-red-50";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "text-green-500 bg-green-50";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "text-orange-500 bg-orange-50";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "text-blue-500 bg-blue-50";
  return "text-gray-500 bg-gray-50";
};

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  const [imageError, setImageError] = useState(false);
  const DocumentIcon = getDocumentIcon(document.mimeType || "");
  const colorClasses = getDocumentColor(document.mimeType || "");

  return (
    <MediaCardContextMenu item={document}>
      <div
        className="aspect-square bg-white rounded-lg overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer border border-gray-200 relative"
        onClick={onClick}
      >
        {document.previewUrl && !imageError ? (
          <img
            src={document.previewUrl}
            alt={document.originalName || document.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center ${colorClasses}`}
          >
            <DocumentIcon className="w-12 h-12 mb-2" />
            <div className="text-xs font-medium text-center px-2 leading-tight">
              {getFileExtension(document.originalName || document.name)}
            </div>
          </div>
        )}

        {/* Overlay with file name */}
        <div className="absolute inset-0 group-hover:bg-black/20 transition-all duration-200 flex items-end">
          <div className="w-full p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate bg-linear-to-t from-black/60 to-transparent">
            {document.originalName || document.name}
          </div>
        </div>
      </div>
    </MediaCardContextMenu>
  );
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()?.toUpperCase()}` : "FILE";
}
