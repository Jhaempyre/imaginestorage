import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import { useNavigate } from "react-router-dom";
import { ExternalLinkIcon, FolderIcon } from "lucide-react";
import type React from "react";
import type { MediaItem } from "@/stores/media-library.store";
import { getActualPath } from "@/lib/utils";

interface MediaCardContextMenuProps extends React.PropsWithChildren {
  item: MediaItem;
}

export function MediaCardContextMenu({
  children,
  item,
}: MediaCardContextMenuProps) {
  const navigate = useNavigate();
  const { navigateToFolder, selectItem } = useMediaLibraryStore();

  const handleOpenInNewTab = () => {
    if (item.openUrl) {
      window.open(item.openUrl, "_blank");
    }
  };

  const handleOpenInAllFiles = () => {
    // Extract the folder path from the full path
    // For example, if fullPath is "folder1/subfolder/file.jpg", we want "folder1/subfolder/"
    const pathSegments = item.fullPath.split("/");
    pathSegments.pop(); // Remove the file name
    const folderPath = pathSegments.length > 0 ? pathSegments.join("/") + "/" : "";
    
    // Navigate to all-files page
    navigate("/all-files");
    
    // Set the folder path to open the correct folder
    // Use a slight delay to ensure the page has navigated before setting the folder
    setTimeout(() => {
      navigateToFolder(getActualPath(folderPath));
      selectItem(item.id);
    }, 100);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleOpenInNewTab}>
          <ExternalLinkIcon className="w-4 h-4 mr-2" />
          Open in new tab
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleOpenInAllFiles}>
          <FolderIcon className="w-4 h-4 mr-2" />
          Open in all files
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}