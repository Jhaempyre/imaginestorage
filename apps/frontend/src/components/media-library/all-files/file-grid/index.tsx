import { FILES_QUERY_KEYS } from "@/api/files";
import {
  useMediaLibraryStore,
  type MediaItem,
} from "@/stores/media-library.store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { FileOperations, useFileOperations } from "../../file-operations";
import FileItem from "./file-item";

interface FileGridProps {
  items: MediaItem[];
}

export function FileGrid({ items }: FileGridProps) {
  const {
    viewMode,
    selectedItems,
    navigateToFolder,
    toggleItemSelection,
    singleToggleSelectItem,
  } = useMediaLibraryStore();

  const {
    showMoveDialog,
    showCopyDialog,
    showDeleteConfirm,
    showShareFileDialog,
    showDetailsDialog,
    dialogs,
  } = useFileOperations();

  // Get selected items data for file operations
  const selectedItemsData = items.filter((item) =>
    selectedItems.includes(item.id)
  );

  // Handler for sharing files
  const handleShareFile = useCallback(
    (fileId: string) => {
      const file = items.find(
        (item) => item.id === fileId && item.type === "file"
      );
      if (file) {
        showShareFileDialog(file);
      }
    },
    [items, showShareFileDialog]
  );

  // Handler for showing file details
  const handleShowDetails = useCallback(
    (fileId: string) => {
      showDetailsDialog(fileId);
    },
    [showDetailsDialog]
  );

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
      singleToggleSelectItem(item.id);
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

  const queryClient = useQueryClient();
  // const getFilesState = useGetFilesCommon();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
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
        onShowDetails={handleShowDetails}
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
        showDetailsPanel={dialogs.showDetailsPanel}
        setShowDetailsPanel={dialogs.setShowDetailsPanel}
        detailsFileId={dialogs.detailsFileId}
        setDetailsFileId={dialogs.setDetailsFileId}
        onOperationComplete={handleRefresh}
      />
    </>
  );
}
