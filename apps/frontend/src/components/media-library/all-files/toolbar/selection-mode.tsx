import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import { X } from "lucide-react";

export function SelectionMode() {
  const { selectItem, selectedItems } = useMediaLibraryStore();
  return (
    <div
      className={cn(
        "absolute h-full w-full flex items-center bg-white",
        selectedItems.length > 0 ? "top-0" : "-top-[52px]",
        "transition-top duration-300"
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => selectItem(null)}
      >
        <X className="w-4 h-4" />
      </Button>
      <span className="ml-2 text-sm">{selectedItems.length} selected</span>
    </div>
  );
}
