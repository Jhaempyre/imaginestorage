import { type MediaItem } from "@/stores/media-library.store";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { DocumentCard } from "./document-card";

interface MonthGroupProps {
  month: string;
  documents: MediaItem[];
  isExpanded: boolean;
  onToggle: () => void;
  onDocumentClick: (document: MediaItem, allDocuments: MediaItem[]) => void;
}

export function MonthGroup({
  month,
  documents,
  isExpanded,
  onToggle,
  onDocumentClick,
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
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      {!isExpanded && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onClick={() => onDocumentClick(document, documents)}
            />
          ))}
        </div>
      )}
    </div>
  );
}