import { useCreateFolder } from "@/api/files/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateFolder() {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { currentPath } = useMediaLibraryStore();
  const createFolderMutation = useCreateFolder();

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

  if (isCreatingFolder) {
    return (
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
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setIsCreatingFolder(true)}
      className="flex items-center space-x-2"
    >
      <FolderPlusIcon className="w-4 h-4" />
      <span>New Folder</span>
    </Button>
  );
}
