import { cn } from "@/lib/utils";
import { getFileIcon } from "../get-file-icon";
import type { ViewProps } from "./types";
import { MediaLibraryContextMenu } from "../context-menu";

interface GridViewProps extends ViewProps {
  onMoveFiles?: () => void;
  onCopyFiles?: () => void;
  onDeleteFiles?: () => void;
  onShareFile?: (fileId: string) => void;
}

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
}: GridViewProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
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
            item={{ id: item.id, name: item.name, type: item.type }}
          >
            <div
              key={item.fullPath}
              className={cn(
                "relative group cursor-pointer rounded-lg border-2",
                "transition-all duration-200 aspect-square",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={(event) => handleItemClick(item, event)}
              onDoubleClick={(event) => handleItemDoubleClick(item, event)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  // onClick={(e) => e.stopPropagation()}
                  // onChange={(e) => handleItemSelect(e, item)}
                  className={cn(
                    "w-4 h-4 text-blue-600",
                    "border-gray-300 rounded focus:ring-blue-500"
                  )}
                />
              </div>

              {/* Item Content */}
              <div className="h-full w-full flex flex-col items-center p-1">
                {item?.previewUrl ? (
                  <div className="flex-1 flex items-center justify-center h-[calc(100%-24px)] max-h-[calc(100%-24px)]">
                    <img
                      src={item.previewUrl}
                      alt={item.originalName}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-[calc(100%-24px)] max-h-[calc(100%-24px)]">
                    {getFileIcon(item)}
                  </div>
                )}
                <span className="text-sm text-center text-gray-900 truncate w-full">
                  {item.originalName || item.name}
                </span>
              </div>
            </div>
          </MediaLibraryContextMenu>
        );
      })}
    </div>
  );
}
