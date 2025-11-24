import { type MediaItem } from "@/stores/media-library.store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: MediaItem | null;
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="relative bg-black">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video player */}
          <video
            controls
            autoPlay
            className="w-full h-auto max-h-[80vh]"
            src={video.openUrl}
          >
            Your browser does not support the video tag.
          </video>

          {/* Video info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h3 className="text-white text-lg font-semibold">
              {video.originalName || video.name}
            </h3>
            {video.fileSize && (
              <p className="text-gray-300 text-sm mt-1">
                {formatFileSize(video.fileSize)}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}