import { GlobalUploader } from "@/components/reusables/uploader/global-uploader";
import { Button } from "@/components/ui/button";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import {
  GridIcon,
  ListIcon,
  MoreHorizontalIcon,
  SortAscIcon,
  SortDescIcon,
} from "lucide-react";
import { CreateFolder } from "./create-folder";
import { Refresh } from "./refresh";
import { SelectionMode } from "./selection-mode";

interface MediaLibraryToolbarProps {}

export function MediaLibraryToolbar({}: MediaLibraryToolbarProps) {
  const { viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder } =
    useMediaLibraryStore();

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="relative flex items-center justify-between p-2 border-b border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center space-x-2">
        <GlobalUploader />
        <CreateFolder />
        <Refresh />
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

      <SelectionMode />
    </div>
  );
}
