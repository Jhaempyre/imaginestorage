import { cn } from "@/lib/utils";
import {
  useMediaLibraryStore,
  type MediaItem,
} from "@/stores/media-library.store";
import { getFileIcon } from "./get-file-icon";
import { MediaLibraryContextMenu } from "./context-menu";

interface FileGridProps {
  items: MediaItem[];
}

export function FileGrid({ items }: FileGridProps) {
  const { viewMode, selectedItems, toggleItemSelection, navigateToFolder } =
    useMediaLibraryStore();

  const handleItemClick = (item: MediaItem) => {
    toggleItemSelection(item.fullPath);
  };

  const handleItemDoubleClick = (item: MediaItem) => {
    if (item.type === "folder") {
      navigateToFolder(item.fullPath);
    } else {
    }
  };

  const handleItemSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: MediaItem
  ) => {
    e.stopPropagation();
    toggleItemSelection(item.fullPath);
  };

  let content = null;
  if (viewMode === "grid") {
    content = (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
          "gap-4 p-4 min-h-10"
        )}
      >
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.fullPath);

          return (
            <div
              key={item.fullPath}
              className={cn(
                "relative group cursor-pointer rounded-lg border-2",
                "transition-all duration-200 aspect-square",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleItemSelect(e, item)}
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
          );
        })}
      </div>
    );
  } else {
    content = (
      <div className="divide-y divide-gray-200 min-h-10">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.fullPath);

          return (
            <div
              key={item.fullPath}
              className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected ? "bg-blue-50" : ""
              }`}
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleItemSelect(e, item)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Icon */}
              <div className="mr-3">
                {item?.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.originalName}
                    loading="lazy"
                    className="size-10 object-cover"
                  />
                ) : (
                  getFileIcon(item)
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.originalName || item.name}
                </p>
              </div>

              {/* Type */}
              <div className="px-3 text-sm text-gray-500">
                {item.type === "folder" ? "Folder" : "File"}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
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
          );
        })}
      </div>
    );
  }

  return <MediaLibraryContextMenu>{content}</MediaLibraryContextMenu>;
}
