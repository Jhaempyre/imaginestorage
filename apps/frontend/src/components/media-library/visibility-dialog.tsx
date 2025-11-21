import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MediaItem } from "@/stores/media-library.store";

interface VisibilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeVisibility: (isPublic: boolean) => void;
  items: MediaItem[];
  isLoading?: boolean;
}

export function VisibilityDialog({ 
  isOpen, 
  onClose, 
  onChangeVisibility, 
  items, 
  isLoading = false 
}: VisibilityDialogProps) {
  const [visibility, setVisibility] = React.useState<string>("private");

  React.useEffect(() => {
    if (isOpen && items.length > 0) {
      // Check if all selected items have the same visibility status
      const firstItem = items[0];
      const allSameVisibility = items.every(item => item.isPublic === firstItem.isPublic);
      
      if (allSameVisibility) {
        setVisibility(firstItem.isPublic ? "public" : "private");
      } else {
        // Mixed visibility - default to private
        setVisibility("private");
      }
    }
  }, [isOpen, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPublic = visibility === "public";
    onChangeVisibility(isPublic);
  };

  const handleClose = () => {
    setVisibility("private");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const itemCount = items.length;
  const itemType = itemCount === 1 
    ? (items[0]?.type === "folder" ? "folder" : "file")
    : "items";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Change Visibility
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visibility">
              Visibility for {itemCount} {itemType}
            </Label>
            <Select
              value={visibility}
              onValueChange={setVisibility}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex flex-col text-left">
                    <span className="font-medium">Private</span>
                    <span className="text-sm text-muted-foreground">
                      Only you can access these {itemType}
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex flex-col text-left">
                    <span className="font-medium">Public</span>
                    <span className="text-sm text-muted-foreground">
                      Anyone with the link can access these {itemType}
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {itemCount > 1 && (
            <div className="text-sm text-muted-foreground">
              This will apply to all {itemCount} selected items.
              For folders, this affects all files inside them too.
            </div>
          )}
          
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
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Visibility"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}