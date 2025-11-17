import { cn } from "@/lib/utils";
import { getFileIcon } from "../get-file-icon";
import type { ViewProps } from "./types";

interface ListViewProps extends ViewProps {}

export function ListView({
  items,
  handleItemClick,
  handleItemDoubleClick,
  // handleItemSelect,
  selectedItems,
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
          <div
            key={item.fullPath}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              isSelected ? "bg-blue-50" : ""
            }`}
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
