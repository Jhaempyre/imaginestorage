import {
  useMediaLibraryStore,
  type MediaItem,
} from "@/stores/media-library.store";
import { MediaLibraryContextMenu } from "./context-menu";
import FileItem from "./file-item";

interface FileGridProps {
  items: MediaItem[];
}

export function FileGrid({ items }: FileGridProps) {
  const {
    viewMode,
    selectedItems,
    toggleItemSelection,
    navigateToFolder,
    selectItem,
  } = useMediaLibraryStore();

  const handleItemClick = (
    item: MediaItem,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.shiftKey) {
      event.preventDefault(); // ← stops text selection
      event.stopPropagation(); // ← avoids bubbling issues
      // Handle shift-click selection logic here if needed
      const currentIndex = items.findIndex((i) => i.id === item.id);
      const lastSelectedIndex = items.findIndex(
        (i) => i.id === selectedItems[selectedItems.length - 1]
      );
      const [start, end] =
        currentIndex < lastSelectedIndex
          ? [currentIndex, lastSelectedIndex]
          : [lastSelectedIndex, currentIndex];
      const newSelected = items.slice(start, end + 1).map((i) => i.id);
      newSelected.forEach((path) => {
        if (!selectedItems.includes(path)) {
          toggleItemSelection(path);
        }
      });
    } else if (event.ctrlKey) {
      toggleItemSelection(item.id);
    } else {
      selectItem(item.id);
    }
  };

  const handleItemDoubleClick = (
    item: MediaItem
    // event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (item.type === "folder") {
      navigateToFolder(item.fullPath);
    } else {
      window.open(item.openUrl, "_blank");
    }
  };

  const handleItemSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: MediaItem
  ) => {
    e.stopPropagation();
    toggleItemSelection(item.fullPath);
  };

  return (
    <MediaLibraryContextMenu>
      <FileItem
        viewMode={viewMode}
        items={items}
        handleItemClick={handleItemClick}
        handleItemDoubleClick={handleItemDoubleClick}
        handleItemSelect={handleItemSelect}
        selectedItems={selectedItems}
      />
    </MediaLibraryContextMenu>
  );
}
