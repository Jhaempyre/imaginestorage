import * as React from "react";
import { Button } from "@/components/ui/button";
import { useGetFiles } from "@/api/files/queries";
import type { MediaItem } from "@/stores/media-library.store";

interface FolderSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string, folderPath: string) => void;
  title: string;
  currentPath?: string;
  excludeIds?: string[]; // Exclude certain folders from selection (e.g., source folders)
}

export function FolderSelectorDialog({
  isOpen,
  onClose,
  onSelectFolder,
  title,
  currentPath = "",
  excludeIds = [],
}: FolderSelectorDialogProps) {
  const [selectedPath, setSelectedPath] = React.useState(currentPath);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  const { data: filesData, isLoading } = useGetFiles({
    prefix: selectedPath,
  });

  const folders = React.useMemo(() => {
    if (!filesData?.data?.items) return [];
    return filesData.data.items.filter(
      (item) => item.type === "folder" && !excludeIds.includes(item.id)
    );
  }, [filesData, excludeIds]);

  const handleFolderDoubleClick = (folder: MediaItem) => {
    setSelectedPath(folder.fullPath);
    setSelectedFolderId(null);
  };

  const handleFolderClick = (folder: MediaItem) => {
    setSelectedFolderId(folder.id);
  };

  const handleConfirm = () => {
    if (selectedFolderId) {
      const selectedFolder = folders.find(f => f.id === selectedFolderId);
      if (selectedFolder) {
        onSelectFolder(selectedFolderId, selectedFolder.fullPath);
      }
    } else {
      // Select current directory (root or current folder)
      if (!selectedPath || selectedPath === "" || selectedPath === "/") {
        onSelectFolder("root", "/");
      } else {
        onSelectFolder("root", selectedPath);
      }
    }
  };

  const navigateUp = () => {
    if (!selectedPath) return;
    const segments = selectedPath.split("/").filter(Boolean);
    segments.pop();
    const newPath = segments.length > 0 ? segments.join("/") + "/" : "";
    setSelectedPath(newPath);
    setSelectedFolderId(null);
  };

  const getBreadcrumbs = () => {
    if (!selectedPath) return [{ name: "Root", path: "" }];
    const segments = selectedPath.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Root", path: "" }];
    
    let accumulatedPath = "";
    segments.forEach((segment) => {
      accumulatedPath += segment + "/";
      breadcrumbs.push({ name: segment, path: accumulatedPath });
    });
    
    return breadcrumbs;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        
        {/* Breadcrumbs */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setSelectedPath(crumb.path);
                    setSelectedFolderId(null);
                  }}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={navigateUp}
            disabled={!selectedPath}
          >
            ← Up
          </Button>
        </div>
        
        {/* Folder List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading folders...</div>
            </div>
          ) : folders.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">No folders found</div>
            </div>
          ) : (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-3 rounded cursor-pointer border-2 transition-colors ${
                    selectedFolderId === folder.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                  onClick={() => handleFolderClick(folder)}
                  onDoubleClick={() => handleFolderDoubleClick(folder)}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span>{folder.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedFolderId 
              ? `Selected: ${folders.find(f => f.id === selectedFolderId)?.name}`
              : "Current location will be used"
            }
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}