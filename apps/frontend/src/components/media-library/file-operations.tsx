import * as React from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FolderSelectorDialog } from "./folder-selector-dialog";
import { FileSharingModal } from "./file-sharing-modal";
import { FileDetailsPanel } from "./file-details-panel";
import { RenameDialog } from "./rename-dialog";
import { VisibilityDialog } from "./visibility-dialog";
import { useMoveFiles, useCopyFiles, useDeleteFiles, useRenameFile, useChangeVisibility } from "@/api/files/mutations";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import type { MediaItem } from "@/stores/media-library.store";

interface FileOperationsProps {
  selectedItems: MediaItem[];
  showMoveDialog: boolean;
  setShowMoveDialog: (show: boolean) => void;
  showCopyDialog: boolean;
  setShowCopyDialog: (show: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  shareFile: MediaItem | null;
  setShareFile: (file: MediaItem | null) => void;
  showDetailsPanel: boolean;
  setShowDetailsPanel: (show: boolean) => void;
  detailsFileId: string | null;
  setDetailsFileId: (fileId: string | null) => void;
  showRenameDialog: boolean;
  setShowRenameDialog: (show: boolean) => void;
  renameItem: MediaItem | null;
  setRenameItem: (item: MediaItem | null) => void;
  showVisibilityDialog: boolean;
  setShowVisibilityDialog: (show: boolean) => void;
  visibilityItems: MediaItem[];
  setVisibilityItems: (items: MediaItem[]) => void;
  onOperationComplete?: () => void;
}

export function FileOperations({ 
  selectedItems, 
  showMoveDialog,
  setShowMoveDialog,
  showCopyDialog,
  setShowCopyDialog,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showShareModal,
  setShowShareModal,
  shareFile,
  setShareFile,
  showDetailsPanel,
  setShowDetailsPanel,
  detailsFileId,
  setDetailsFileId,
  showRenameDialog,
  setShowRenameDialog,
  renameItem,
  setRenameItem,
  showVisibilityDialog,
  setShowVisibilityDialog,
  visibilityItems,
  setVisibilityItems,
  onOperationComplete 
}: FileOperationsProps) {
  
  const { 
    clearSelection, 
    navigateToFolder, 
    // setCurrentPath,
    // currentPath 
  } = useMediaLibraryStore();
  
  // State to track destination for navigation after operations
  const [pendingDestination, setPendingDestination] = React.useState<string | null>(null);

  const moveFilesMutation = useMoveFiles({
    onSuccess: () => {
      clearSelection();
      // Navigate to destination folder after successful move
      if (pendingDestination) {
        if (pendingDestination === 'root') {
          navigateToFolder('');
        } else {
          navigateToFolder(pendingDestination);
        }
        setPendingDestination(null);
      }
      setShowMoveDialog(false);
      onOperationComplete?.();
    },
    onError: (error) => {
      console.error("Move operation failed:", error);
      setPendingDestination(null);
      // TODO: Show error notification
    },
  });

  const copyFilesMutation = useCopyFiles({
    onSuccess: () => {
      clearSelection();
      // Navigate to destination folder after successful copy
      if (pendingDestination) {
        if (pendingDestination === 'root') {
          navigateToFolder('');
        } else {
          navigateToFolder(pendingDestination);
        }
        setPendingDestination(null);
      }
      setShowCopyDialog(false);
      onOperationComplete?.();
    },
    onError: (error) => {
      console.error("Copy operation failed:", error);
      setPendingDestination(null);
      // TODO: Show error notification
    },
  });

  const deleteFilesMutation = useDeleteFiles({
    onSuccess: () => {
      clearSelection();
      // Stay in current location and refetch data after delete
      setShowDeleteConfirm(false);
      onOperationComplete?.();
    },
    onError: (error) => {
      console.error("Delete operation failed:", error);
      // TODO: Show error notification
    },
  });

  const renameFileMutation = useRenameFile({
    onSuccess: () => {
      setShowRenameDialog(false);
      setRenameItem(null);
      onOperationComplete?.();
    },
    onError: (error) => {
      console.error("Rename operation failed:", error);
      // TODO: Show error notification
    },
  });

  const changeVisibilityMutation = useChangeVisibility({
    onSuccess: () => {
      setShowVisibilityDialog(false);
      setVisibilityItems([]);
      onOperationComplete?.();
    },
    onError: (error) => {
      console.error("Change visibility operation failed:", error);
      // TODO: Show error notification
    },
  });


  const handleMoveFiles = (destinationFolderId: string, destinationPath: string) => {
    const sourceIds = selectedItems.map(item => item.id);
    
    // Set pending destination for navigation after successful operation
    if (destinationFolderId === 'root') {
      setPendingDestination('root');
    } else {
      // Use the destination path for navigation
      setPendingDestination(destinationPath);
    }
    
    moveFilesMutation.mutate({ sourceIds, destinationFolderId, destinationPath });
  };

  const handleCopyFiles = (destinationFolderId: string, destinationPath: string) => {
    const sourceIds = selectedItems.map(item => item.id);
    
    // Set pending destination for navigation after successful operation
    if (destinationFolderId === 'root') {
      setPendingDestination('root');
    } else {
      // Use the destination path for navigation
      setPendingDestination(destinationPath);
    }
    
    copyFilesMutation.mutate({ sourceIds, destinationFolderId, destinationPath });
  };

  const handleDeleteFiles = () => {
    const ids = selectedItems.map(item => item.id);
    deleteFilesMutation.mutate({ ids });
  };

  const handleRenameFile = (newName: string) => {
    if (renameItem) {
      renameFileMutation.mutate({ id: renameItem.id, newName });
    }
  };

  const handleChangeVisibility = (isPublic: boolean) => {
    if (visibilityItems.length > 0) {
      const ids = visibilityItems.map(item => item.id);
      changeVisibilityMutation.mutate({ id: ids, isPublic });
    }
  };

  const getSelectedItemsText = () => {
    if (selectedItems.length === 0) return "";
    if (selectedItems.length === 1) {
      return `"${selectedItems[0].name}"`;
    }
    return `${selectedItems.length} items`;
  };

  const getExcludeIds = () => {
    // Exclude selected folders from destination selection to prevent moving/copying into themselves
    return selectedItems.filter(item => item.type === "folder").map(item => item.id);
  };

  return (
    <>
      {/* Move Dialog */}
      <FolderSelectorDialog
        isOpen={showMoveDialog}
        onClose={() => setShowMoveDialog(false)}
        onSelectFolder={handleMoveFiles}
        title={`Move ${getSelectedItemsText()}`}
        excludeIds={getExcludeIds()}
      />

      {/* Copy Dialog */}
      <FolderSelectorDialog
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        onSelectFolder={handleCopyFiles}
        title={`Copy ${getSelectedItemsText()}`}
        excludeIds={getExcludeIds()}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteFiles}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${getSelectedItemsText()}? This action will move the items to trash and can be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteFilesMutation.isPending}
      />

      {/* File Sharing Modal */}
      <FileSharingModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareFile(null);
        }}
        file={shareFile}
      />

      {/* File Details Panel */}
      <FileDetailsPanel
        isOpen={showDetailsPanel}
        onClose={() => {
          setShowDetailsPanel(false);
          setDetailsFileId(null);
        }}
        fileId={detailsFileId}
      />

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={showRenameDialog}
        onClose={() => {
          setShowRenameDialog(false);
          setRenameItem(null);
        }}
        onRename={handleRenameFile}
        item={renameItem}
        isLoading={renameFileMutation.isPending}
      />

      {/* Visibility Dialog */}
      <VisibilityDialog
        isOpen={showVisibilityDialog}
        onClose={() => {
          setShowVisibilityDialog(false);
          setVisibilityItems([]);
        }}
        onChangeVisibility={handleChangeVisibility}
        items={visibilityItems}
        isLoading={changeVisibilityMutation.isPending}
      />

      {/* Expose functions to parent components */}
      <div style={{ display: 'none' }}>
        <button ref={(el) => {
          if (el) {
            (el as any).showMoveDialog = () => setShowMoveDialog(true);
            (el as any).showCopyDialog = () => setShowCopyDialog(true);
            (el as any).showDeleteConfirm = () => setShowDeleteConfirm(true);
          }
        }} />
      </div>
    </>
  );
}

// Hook to provide file operations functions
export function useFileOperations() {
  const [showMoveDialog, setShowMoveDialog] = React.useState(false);
  const [showCopyDialog, setShowCopyDialog] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [shareFile, setShareFile] = React.useState<MediaItem | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = React.useState(false);
  const [detailsFileId, setDetailsFileId] = React.useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [renameItem, setRenameItem] = React.useState<MediaItem | null>(null);
  const [showVisibilityDialog, setShowVisibilityDialog] = React.useState(false);
  const [visibilityItems, setVisibilityItems] = React.useState<MediaItem[]>([]);

  const showShareFileDialog = (file: MediaItem) => {
    setShareFile(file);
    setShowShareModal(true);
  };

  const showDetailsDialog = (fileId: string) => {
    setDetailsFileId(fileId);
    setShowDetailsPanel(true);
  };

  const openRenameDialog = (item: MediaItem) => {
    setRenameItem(item);
    setShowRenameDialog(true);
  };

  const openVisibilityDialog = (items: MediaItem[]) => {
    setVisibilityItems(items);
    setShowVisibilityDialog(true);
  };

  return {
    showMoveDialog: () => setShowMoveDialog(true),
    showCopyDialog: () => setShowCopyDialog(true),
    showDeleteConfirm: () => setShowDeleteConfirm(true),
    showShareFileDialog,
    showDetailsDialog,
    openRenameDialog,
    openVisibilityDialog,
    dialogs: {
      showMoveDialog,
      setShowMoveDialog,
      showCopyDialog,
      setShowCopyDialog,
      showDeleteConfirm,
      setShowDeleteConfirm,
      showShareModal,
      setShowShareModal,
      shareFile,
      setShareFile,
      showDetailsPanel,
      setShowDetailsPanel,
      detailsFileId,
      setDetailsFileId,
      showRenameDialog,
      setShowRenameDialog,
      renameItem,
      setRenameItem,
      showVisibilityDialog,
      setShowVisibilityDialog,
      visibilityItems,
      setVisibilityItems,
    },
  };
}