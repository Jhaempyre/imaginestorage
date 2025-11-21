import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import type React from "react";

interface MediaLibraryContextMenuProps extends React.PropsWithChildren {
  onMoveFiles?: () => void;
  onCopyFiles?: () => void;
  onDeleteFiles?: () => void;
  onShareFile?: () => void;
  onShowDetails?: () => void;
  onRenameItem?: () => void;
  onChangeVisibility?: () => void;
  item?: { id: string; name: string; type: "file" | "folder" };
}

export function MediaLibraryContextMenu({
  children,
  onMoveFiles,
  onCopyFiles,
  onDeleteFiles,
  onShareFile,
  onShowDetails,
  onRenameItem,
  onChangeVisibility,
  item,
}: MediaLibraryContextMenuProps) {
  const { selectedItems, selectItem } = useMediaLibraryStore();
  
  const handleContextMenuAction = (action: () => void) => {
    // If right-clicked item is not selected, select it first
    if (item && !selectedItems.includes(item.id)) {
      selectItem(item.id);
    }
    action();
  };

  const hasSelection = selectedItems.length > 0;
  const selectionText = selectedItems.length === 1 ? "item" : "items";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem 
          inset
          disabled={!hasSelection}
          onClick={() => handleContextMenuAction(onMoveFiles || (() => {}))}
        >
          Move {hasSelection && `(${selectedItems.length} ${selectionText})`}
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem 
          inset
          disabled={!hasSelection}
          onClick={() => handleContextMenuAction(onCopyFiles || (() => {}))}
        >
          Copy {hasSelection && `(${selectedItems.length} ${selectionText})`}
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem inset disabled>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          inset
          onClick={() => handleContextMenuAction(onShowDetails || (() => {}))}
          disabled={selectedItems.length !== 1}
        >
          Details
          <ContextMenuShortcut>⌘I</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem 
          inset
          onClick={() => handleContextMenuAction(onRenameItem || (() => {}))}
          disabled={selectedItems.length !== 1}
        >
          Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem 
          inset
          onClick={() => handleContextMenuAction(onChangeVisibility || (() => {}))}
          disabled={selectedItems.length === 0}
        >
          Change Visibility
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        
        {/* Share option - only for single file selection */}
        {item?.type === "file" && selectedItems.length <= 1 && (
          <>
            <ContextMenuItem 
              inset
              onClick={() => handleContextMenuAction(onShareFile || (() => {}))}
            >
              Share
              <ContextMenuShortcut>⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          variant="destructive"
          inset
          disabled={!hasSelection}
          onClick={() => handleContextMenuAction(onDeleteFiles || (() => {}))}
        >
          Delete {hasSelection && `(${selectedItems.length} ${selectionText})`}
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
