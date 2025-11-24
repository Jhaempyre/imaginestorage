import { useGetDocumentFiles } from "@/api/files/queries";
import { type MediaItem } from "@/stores/media-library.store";
import { FileTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthGroup } from "./month-group";
import { transformDocumentFileToMediaItem } from "./utils";

interface DocumentsByMonth {
  [key: string]: MediaItem[];
}

export function DocumentsPage() {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Fetch all document files using the dedicated documents API
  const { data: documentsResponse, isLoading, error } = useGetDocumentFiles();
  console.log({ documentsResponse });

  // Group documents by month from the API response
  const documentsByMonth = useMemo(() => {
    if (!documentsResponse?.data || !Array.isArray(documentsResponse.data)) return {};

    const documentsByMonthMap: DocumentsByMonth = {};

    // Process each monthly group from the API and sort by date (most recent first)
    const sortedMonthlyGroups = [...documentsResponse.data].sort((a, b) => {
      // Sort by year first, then by month (descending)
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    sortedMonthlyGroups.forEach((monthlyGroup) => {
      const monthKey = `${monthlyGroup.year}-${String(
        monthlyGroup.month
      ).padStart(2, "0")}`;

      // Transform DocumentFile objects to MediaItem objects and sort by creation date
      const transformedDocuments = monthlyGroup.files
        .map(transformDocumentFileToMediaItem)
        .sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

      documentsByMonthMap[monthKey] = transformedDocuments;
    });

    return documentsByMonthMap;
  }, [documentsResponse]);

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

  const handleDocumentClick = (document: MediaItem) => {
    window.open(document.openUrl, "_blank");
  };

  const totalDocuments = Object.values(documentsByMonth).reduce(
    (acc, documents) => acc + documents.length,
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
          Error loading documents:{" "}
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
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalDocuments} {totalDocuments === 1 ? "document" : "documents"} •{" "}
              {Object.keys(documentsByMonth).length} months
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {Object.keys(documentsByMonth).length === 0 ? (
          <div className="text-center py-12">
            <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-500">
              Upload some documents to see them organized by month here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByMonth).map(([monthKey, documents]) => (
              <MonthGroup
                key={monthKey}
                month={formatMonthDisplay(monthKey)}
                documents={documents}
                isExpanded={expandedMonths.has(monthKey)}
                onToggle={() => toggleMonth(monthKey)}
                onDocumentClick={handleDocumentClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;