import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MediaItem } from "@/stores/media-library.store";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  item: MediaItem | null;
  isLoading?: boolean;
}

export function RenameDialog({ 
  isOpen, 
  onClose, 
  onRename, 
  item, 
  isLoading = false 
}: RenameDialogProps) {
  const [newName, setNewName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen && item) {
      // Remove file extension for editing (user can add it back)
      const nameWithoutExtension = item.type === "file" 
        ? item.name.replace(/\.[^/.]+$/, "")
        : item.name;
      setNewName(nameWithoutExtension);
      
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && item) {
      // Add back extension if it's a file and user didn't include one
      let finalName = newName.trim();
      if (item.type === "file" && item.name.includes(".") && !finalName.includes(".")) {
        const extension = item.name.split(".").pop();
        finalName = `${finalName}.${extension}`;
      }
      onRename(finalName);
    }
  };

  const handleClose = () => {
    setNewName("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Rename {item?.type === "folder" ? "Folder" : "File"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newName">New name</Label>
            <Input
              ref={inputRef}
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Enter new ${item?.type === "folder" ? "folder" : "file"} name`}
              disabled={isLoading}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newName.trim() || isLoading}
            >
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}