import { useGetVideoFiles } from "@/api/files/queries";
import { type MediaItem } from "@/stores/media-library.store";
import { PlayIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthGroup } from "./month-group";
import { transformVideoFileToMediaItem } from "./utils";

interface VideosByMonth {
  [key: string]: MediaItem[];
}

export function VideosPage() {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Fetch all video files using the dedicated videos API
  const { data: videosResponse, isLoading, error } = useGetVideoFiles();
  console.log({ videosResponse });

  // Group videos by month from the API response
  const videosByMonth = useMemo(() => {
    if (!videosResponse?.data || !Array.isArray(videosResponse.data)) return {};

    const videosByMonthMap: VideosByMonth = {};

    // Process each monthly group from the API and sort by date (most recent first)
    const sortedMonthlyGroups = [...videosResponse.data].sort((a, b) => {
      // Sort by year first, then by month (descending)
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    sortedMonthlyGroups.forEach((monthlyGroup) => {
      const monthKey = `${monthlyGroup.year}-${String(
        monthlyGroup.month
      ).padStart(2, "0")}`;

      // Transform VideoFile objects to MediaItem objects and sort by creation date
      const transformedVideos = monthlyGroup.files
        .map(transformVideoFileToMediaItem)
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

      videosByMonthMap[monthKey] = transformedVideos;
    });

    return videosByMonthMap;
  }, [videosResponse]);

  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey?.split?.("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const handleVideoClick = (video: MediaItem) => {
    window.open(video.openUrl, "_blank");
  };

  const totalVideos = Object.values(videosByMonth).reduce(
    (acc, videos) => acc + videos.length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-red-600">
          Error loading videos:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalVideos} {totalVideos === 1 ? "video" : "videos"} •{" "}
              {Object.keys(videosByMonth).length} months
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {Object.keys(videosByMonth).length === 0 ? (
          <div className="text-center py-12">
            <PlayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500">
              Upload some videos to see them organized by month here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(videosByMonth).map(([monthKey, videos]) => (
              <MonthGroup
                key={monthKey}
                month={formatMonthDisplay(monthKey)}
                videos={videos}
                isExpanded={expandedMonths.has(monthKey)}
                onToggle={() => toggleMonth(monthKey)}
                onVideoClick={handleVideoClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideosPage;