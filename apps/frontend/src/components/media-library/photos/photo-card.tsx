import { type MediaItem } from "@/stores/media-library.store";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

interface PhotoCardProps {
  photo: MediaItem;
  onClick: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="aspect-square bg-gray-100 rounded-lg overflow-hidden group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer relative"
      onClick={onClick}
    >
      {photo.previewUrl && !imageError ? (
        <img
          src={photo.previewUrl}
          alt={photo.originalName || photo.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Overlay with file name */}
      <div className="absolute inset-0 group-hover:bg-black/20 transition-all duration-200 flex items-end">
        <div className="w-full p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
          {photo.originalName || photo.name}
        </div>
      </div>
    </div>
  );
}
