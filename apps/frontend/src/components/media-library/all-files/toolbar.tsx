import { useCreateFolder } from "@/api/files/mutations";
import { FILES_QUERY_KEYS } from "@/api/files/queries";
import { GlobalUploader } from "@/components/reusables/uploader/global-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import { useQueryClient } from "@tanstack/react-query";
import {
  FolderPlusIcon,
  GridIcon,
  ListIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MediaLibraryToolbar() {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    searchQuery,
    setSortOrder,
    currentPath,
  } = useMediaLibraryStore();

  const queryClient = useQueryClient();
  const queryState = queryClient.getQueryState(
    FILES_QUERY_KEYS.list({
      prefix: currentPath,
      search: searchQuery || undefined,
      sortBy,
      sortOrder,
    })
  );
  console.log({ queryState });

  const createFolderMutation = useCreateFolder();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    console.log("Creating folder:", newFolderName, "in path:", currentPath);
    try {
      createFolderMutation.mutate({
        fullPath: currentPath + newFolderName + "/",
      });
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        <GlobalUploader />
        {/* Create Folder */}
        {isCreatingFolder ? (
          <div className="flex items-center space-x-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-32"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFolder}>
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center space-x-2"
          >
            <FolderPlusIcon className="w-4 h-4" />
            <span>New Folder</span>
          </Button>
        )}

        {/* Refresh */}
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCwIcon className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {/* Sort Controls */}
        <div className="flex items-center space-x-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="originalName">Name</option>
            <option value="createdAt">Date</option>
            <option value="fileSize">Size</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="p-2"
          >
            {sortOrder === "asc" ? (
              <SortAscIcon className="w-4 h-4" />
            ) : (
              <SortDescIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none border-0"
          >
            <GridIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none border-0"
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* More Actions */}
        <Button variant="outline" size="sm" className="p-2">
          <MoreHorizontalIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
