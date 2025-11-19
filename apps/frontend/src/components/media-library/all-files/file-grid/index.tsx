import {
  useMediaLibraryStore,
  type MediaItem,
} from "@/stores/media-library.store";
import { FileOperations, useFileOperations } from "../../file-operations";
import FileItem from "./file-item";
import { useCallback } from "react";

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

  const { showMoveDialog, showCopyDialog, showDeleteConfirm, showShareFileDialog, dialogs } = useFileOperations();

  // Get selected items data for file operations
  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));

  // Handler for sharing files
  const handleShareFile = useCallback((fileId: string) => {
    const file = items.find(item => item.id === fileId && item.type === "file");
    if (file) {
      showShareFileDialog(file);
    }
  }, [items, showShareFileDialog]);

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
    <>
      <FileItem
        viewMode={viewMode}
        items={items}
        handleItemClick={handleItemClick}
        handleItemDoubleClick={handleItemDoubleClick}
        handleItemSelect={handleItemSelect}
        selectedItems={selectedItems}
        onMoveFiles={showMoveDialog}
        onCopyFiles={showCopyDialog}
        onDeleteFiles={showDeleteConfirm}
        onShareFile={handleShareFile}
      />
      
      <FileOperations
        selectedItems={selectedItemsData}
        showMoveDialog={dialogs.showMoveDialog}
        setShowMoveDialog={dialogs.setShowMoveDialog}
        showCopyDialog={dialogs.showCopyDialog}
        setShowCopyDialog={dialogs.setShowCopyDialog}
        showDeleteConfirm={dialogs.showDeleteConfirm}
        setShowDeleteConfirm={dialogs.setShowDeleteConfirm}
        showShareModal={dialogs.showShareModal}
        setShowShareModal={dialogs.setShowShareModal}
        shareFile={dialogs.shareFile}
        setShareFile={dialogs.setShareFile}
      />
    </>
  );
}
