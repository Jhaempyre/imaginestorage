import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { MediaLibraryContextMenu } from "../context-menu";
import { getFileIcon } from "../get-file-icon";
import type { ViewProps } from "./types";

// Helper function to format file sizes
// const formatFileSize = (bytes: number): string => {
//   if (bytes === 0) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + " " + sizes[i];
// };

interface GridViewProps extends ViewProps {}

export function GridView({
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
}: GridViewProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        "gap-4 p-4 min-h-10",
        selectedItems?.length > 0 ? "select-none" : ""
      )}
    >
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);

        return (
          <MediaLibraryContextMenu
            onMoveFiles={onMoveFiles}
            onCopyFiles={onCopyFiles}
            onDeleteFiles={onDeleteFiles}
            onShareFile={() => onShareFile?.(item.id)}
            onShowDetails={() => onShowDetails?.(item.id)}
            onRenameItem={() => onRenameItem?.(item.id)}
            onChangeVisibility={onChangeVisibility}
            onOpenFile={() => item.openUrl && window.open(item.openUrl, '_blank')}
            onDownloadFile={() => item.downloadUrl && window.open(item.downloadUrl, '_blank')}
            item={{ id: item.id, name: item.name, type: item.type }}
          >
            <div
              key={item.fullPath}
              className={cn(
                "relative group cursor-pointer rounded-lg border-2",
                "transition-all duration-200 aspect-square group",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={(event) => handleItemClick(item, event)}
              onDoubleClick={(event) => handleItemDoubleClick(item, event)}
            >
              {/* Top Bar with Selection Checkbox and Visibility Indicator */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                {/* Visibility Indicator */}
                {item.isPublic ? (
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full p-1",
                      "backdrop-blur-sm border",
                      item.isPublic
                        ? "bg-green-100/80 border-green-200 text-green-700"
                        : "bg-gray-100/80 border-gray-200 text-gray-600"
                    )}
                  >
                    <Globe className="w-3 h-3" />
                    {/* ) : // <Lock className="w-3 h-3" /> */}
                  </div>
                ) : (
                  <div />
                )}

                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  // onClick={(e) => e.stopPropagation()}
                  // onChange={(e) => handleItemSelect(e, item)}
                  className={cn(
                    "w-4 h-4 text-blue-600",
                    "border-gray-300 rounded focus:ring-blue-500",
                    "backdrop-blur-sm"
                  )}
                />
              </div>

              {/* Item Content */}
              <div className="h-full w-full flex flex-col relative">
                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center p-2 overflow-hidden rounded-md">
                  {item?.previewUrl ? (
                    <div className="relative w-full h-full rounded-md overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt={item.originalName}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                      />
                      {/* File Type Badge on Preview */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded p-1",
                            "bg-black/60 backdrop-blur-sm"
                          )}
                        >
                          {/* <div className="text-white">
                            {getFileIcon(item, "sm")}
                          </div> */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(item, "lg")}
                    </div>
                  )}
                </div>

                {/* Bottom Info Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <div className={cn("bg-background rounded-sm", "px-2 py-1")}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="mr-1">
                        {getFileIcon(item, "md")}
                      </span>
                      <span className="text-xs text-gray-900 truncate flex-1 font-medium">
                        {item.originalName || item.name}
                      </span>

                      {/* File Type Extension */}
                      {item.type === "file" && (
                        <span className="text-xs text-gray-500 font-mono">
                          {(
                            (item.originalName || item.name).split(".").pop() ||
                            ""
                          ).toLowerCase()}
                        </span>
                      )}
                    </div>
                    {/* File Size for files */}
                    {/* {item.type === "file" && item.fileSize && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatFileSize(item.fileSize)}
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          </MediaLibraryContextMenu>
        );
      })}
    </div>
  );
}
