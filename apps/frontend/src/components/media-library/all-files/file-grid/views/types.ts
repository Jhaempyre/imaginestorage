import type { MediaItem } from "@/stores/media-library.store";

export interface ViewProps {
  items: MediaItem[];
  selectedItems: string[];
  handleItemClick: (item: MediaItem, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleItemDoubleClick: (item: MediaItem, event: React.MouseEvent<HTMLDivElement, MouseEvent>, ) => void;
  handleItemSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    item: MediaItem
  ) => void;
  onMoveFiles?: () => void;
  onCopyFiles?: () => void;
  onDeleteFiles?: () => void;
  onShareFile?: (fileId: string) => void;
}
