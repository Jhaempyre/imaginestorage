import { type MediaItem } from "@/stores/media-library.store";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { MediaCardContextMenu } from "../shared/media-card-context-menu";

interface VideoCardProps {
  video: MediaItem;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <MediaCardContextMenu item={video}>
      <div
        className="aspect-square bg-gray-100 rounded-lg overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer relative"
        onClick={onClick}
      >
        {video.previewUrl && !imageError ? (
          <img
            src={video.previewUrl}
            alt={video.originalName || video.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <PlayIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Video play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-90 transition-opacity duration-200">
          <div className="bg-black/50 rounded-full p-3">
            <PlayIcon className="w-6 h-6 text-white" fill="white" />
          </div>
        </div>

        {/* Overlay with file name */}
        <div className="absolute inset-0 group-hover:bg-black/20 transition-all duration-200 flex items-end">
          <div className="w-full p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
            {video.originalName || video.name}
          </div>
        </div>
      </div>
    </MediaCardContextMenu>
  );
}