import { type MediaItem } from "@/stores/media-library.store";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { VideoCard } from "./video-card";

interface MonthGroupProps {
  month: string;
  videos: MediaItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onVideoClick: (video: MediaItem, allVideos: MediaItem[]) => void;
}

export function MonthGroup({
  month,
  videos,
  isExpanded,
  onToggle,
  onVideoClick,
}: MonthGroupProps) {
  return (
    <div className="mb-6">
      {/* Month Header */}
      <div
        className="flex items-center justify-between  rounded-lg cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          {!isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </span>
        </div>
      </div>

      {/* Videos Grid */}
      {!isExpanded && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => onVideoClick(video, videos)}
            />
          ))}
        </div>
      )}
    </div>
  );
}