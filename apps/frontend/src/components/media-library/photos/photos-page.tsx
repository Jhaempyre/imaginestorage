import { useGetImageFiles } from "@/api/files/queries";
import { type MediaItem } from "@/stores/media-library.store";
import { ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthGroup } from "./moth-group";
import { transformImageFileToMediaItem } from "./utils";

interface PhotosByMonth {
  [key: string]: MediaItem[];
}

export function PhotosPage() {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Fetch all image files using the dedicated images API
  const { data: imagesResponse, isLoading, error } = useGetImageFiles();
  console.log({ imagesResponse });

  // Group photos by month from the API response
  const photosByMonth = useMemo(() => {
    if (!imagesResponse?.data || !Array.isArray(imagesResponse.data)) return {};

    const photosByMonthMap: PhotosByMonth = {};

    // Process each monthly group from the API and sort by date (most recent first)
    const sortedMonthlyGroups = [...imagesResponse.data].sort((a, b) => {
      // Sort by year first, then by month (descending)
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    sortedMonthlyGroups.forEach((monthlyGroup) => {
      const monthKey = `${monthlyGroup.year}-${String(
        monthlyGroup.month
      ).padStart(2, "0")}`;

      // Transform ImageFile objects to MediaItem objects and sort by creation date
      const transformedPhotos = monthlyGroup.files
        .map(transformImageFileToMediaItem)
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

      photosByMonthMap[monthKey] = transformedPhotos;
    });

    return photosByMonthMap;
  }, [imagesResponse]);

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

  const handlePhotoClick = (photo: MediaItem) => {
    window.open(photo.openUrl, "_blank");
  };

  // const handleModalNavigate = (index: number) => {
  //   setCurrentPhotoIndex(index);
  // };

  const totalPhotos = Object.values(photosByMonth).reduce(
    (acc, photos) => acc + photos.length,
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
          Error loading photos:{" "}
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
            <h1 className="text-2xl font-bold text-gray-900">Photos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalPhotos} {totalPhotos === 1 ? "photo" : "photos"} •{" "}
              {Object.keys(photosByMonth).length} months
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {Object.keys(photosByMonth).length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No photos found
            </h3>
            <p className="text-gray-500">
              Upload some images to see them organized by month here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(photosByMonth).map(([monthKey, photos]) => (
              <MonthGroup
                key={monthKey}
                month={formatMonthDisplay(monthKey)}
                photos={photos}
                isExpanded={expandedMonths.has(monthKey)}
                onToggle={() => toggleMonth(monthKey)}
                onPhotoClick={handlePhotoClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotosPage;
