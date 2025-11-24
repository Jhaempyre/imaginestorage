import { type MediaItem } from "@/stores/media-library.store";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PhotoModalProps {
  photos: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoModal({ photos, currentIndex, isOpen, onClose, onNavigate }: PhotoModalProps) {
  const [imageError, setImageError] = useState(false);
  
  const currentPhoto = photos[currentIndex];
  
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleDownload = () => {
    if (currentPhoto.downloadUrl) {
      window.open(currentPhoto.downloadUrl, '_blank');
    }
  };

  if (!currentPhoto) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-linear-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-lg font-medium">{currentPhoto.originalName || currentPhoto.name}</h2>
              <p className="text-sm text-gray-300">
                {currentIndex + 1} of {photos.length}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {currentPhoto.downloadUrl && (
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Download"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Previous photo"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        )}
        
        {currentIndex < photos.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Next photo"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}

        {/* Main image */}
        <div className="w-full h-full flex items-center justify-center p-8">
          {currentPhoto.previewUrl && !imageError ? (
            <img
              src={currentPhoto.previewUrl}
              alt={currentPhoto.originalName || currentPhoto.name}
              className="max-w-full max-h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center w-64 h-64 bg-gray-800 rounded-lg">
              <div className="text-center text-gray-400">
                <div className="text-sm">Preview not available</div>
                <div className="text-xs mt-1">{currentPhoto.originalName || currentPhoto.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/50 to-transparent">
          <div className="text-center text-white">
            <div className="text-sm text-gray-300">
              {currentPhoto.fileSize && (
                <span>
                  {(currentPhoto.fileSize / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}