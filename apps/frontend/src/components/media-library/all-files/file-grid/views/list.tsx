import { cn } from "@/lib/utils";
import { Download, ExternalLink, Globe } from "lucide-react";
import { MediaLibraryContextMenu } from "../context-menu";
import { getFileIcon } from "../get-file-icon";
import type { ViewProps } from "./types";

// Helper function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
};

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

interface ListViewProps extends ViewProps {}

export function ListView({
  items,
  handleItemClick,
  handleItemDoubleClick,
  // handleItemSelect,
  selectedItems,
  onMoveFiles,
  onCopyFiles,
  onDeleteFiles,
  onShareFile,
  onShowDetails,
  onRenameItem,
  onChangeVisibility,
}: ListViewProps) {
  return (
    <div
      className={cn(
        "divide-y divide-gray-200 min-h-10",
        selectedItems?.length > 0 ? "select-none" : ""
      )}
    >
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);

        return (
          <MediaLibraryContextMenu
            key={item.id}
            onMoveFiles={onMoveFiles}
            onCopyFiles={onCopyFiles}
            onDeleteFiles={onDeleteFiles}
            onShareFile={() => onShareFile?.(item.id)}
            onShowDetails={() => onShowDetails?.(item.id)}
            onRenameItem={() => onRenameItem?.(item.id)}
            onChangeVisibility={onChangeVisibility}
            onOpenFile={() =>
              item.openUrl && window.open(item.openUrl, "_blank")
            }
            onDownloadFile={() =>
              item.downloadUrl && window.open(item.downloadUrl, "_blank")
            }
            item={{ id: item.id, name: item.name, type: item.type }}
          >
            <div
              className={cn(
                "flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                isSelected ? "bg-blue-50 border-l-2 border-blue-500" : ""
              )}
              onClick={(event) => handleItemClick(item, event)}
              onDoubleClick={(event) => handleItemDoubleClick(item, event)}
            >
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                // onChange={(e) => handleItemSelect(item, e)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Icon with preview */}
              <div className="mr-3 relative">
                {item?.previewUrl ? (
                  <div className="relative">
                    <img
                      src={item.previewUrl}
                      alt={item.originalName}
                      loading="lazy"
                      className="size-10 object-cover rounded"
                    />
                    {/* File type badge on preview */}
                    <div className="absolute -top-1 -right-1 bg-black/60 rounded-full p-0.5">
                      {getFileIcon(item, "sm")}
                    </div>
                  </div>
                ) : (
                  <div className="size-10 flex items-center justify-center">
                    {getFileIcon(item, "md")}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {/* Name and details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.originalName || item.name}
                    </p>

                    {/* Visibility indicator */}
                    {item.isPublic ? (
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-full p-1",
                          "border",
                          "bg-green-100 border-green-200 text-green-700"
                          // item.isPublic
                          //   ? "bg-green-100 border-green-200 text-green-700"
                          //   : "bg-gray-100 border-gray-200 text-gray-600"
                        )}
                      >
                        <Globe className="w-3 h-3" />
                        {/* // <Lock className="w-3 h-3" /> */}
                      </div>
                    ) : null}
                  </div>

                  {/* File details */}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{item.type === "folder" ? "Folder" : "File"}</span>
                    {item.type === "file" && (
                      <>
                        <span className="font-mono uppercase">
                          {getFileExtension(item.originalName || item.name)}
                        </span>
                        {item.fileSize && (
                          <span>{formatFileSize(item.fileSize)}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                {/* Open button */}
                {item.openUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.openUrl, "_blank");
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Open file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Download button */}
                {item.downloadUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.downloadUrl, "_blank");
                    }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Context menu trigger */}
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </MediaLibraryContextMenu>
        );
      })}
    </div>
  );
}
