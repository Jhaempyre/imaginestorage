import { useGetFileDetails } from "@/api/files/queries";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ExternalLink, Eye, File, HardDrive, User, X } from "lucide-react";

interface FileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
}

export function FileDetailsPanel({ isOpen, onClose, fileId }: FileDetailsPanelProps) {
  const { data: fileDetailsResponse, isLoading, error } = useGetFileDetails(fileId);

  const fileDetails = fileDetailsResponse?.data;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";
    if (mimeType?.includes("pdf")) return "📄";
    if (mimeType?.includes("word")) return "📝";
    if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) return "📊";
    if (mimeType?.includes("powerpoint") || mimeType?.includes("presentation")) return "📊";
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return "🗜️";
    return "📄";
  };

  const renderPreview = () => {
    if (!fileDetails) return null;

    const { mimeType, previewUrl, openUrl } = fileDetails;

    if (previewUrl) {
      if (mimeType?.startsWith("image/")) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <img 
              src={previewUrl} 
              alt={fileDetails.originalName}
              className="max-w-full h-auto max-h-64 mx-auto rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        );
      }
      
      if (mimeType?.startsWith("video/")) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <video 
              controls 
              className="max-w-full h-auto max-h-64 mx-auto rounded"
              preload="metadata"
            >
              <source src={previewUrl} type={mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      if (mimeType?.startsWith("audio/")) {
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <audio controls className="w-full">
              <source src={previewUrl} type={mimeType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      }
    }

    // Fallback preview
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">{getFileIcon(mimeType)}</div>
        <p className="text-sm text-gray-600">Preview not available</p>
        {openUrl && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open(openUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open File
          </Button>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/10 bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">File Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading...</div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              <p>Failed to load file details</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {fileDetails && (
            <>
              {/* Preview Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </h3>
                {renderPreview()}
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <File className="w-4 h-4 mr-2" />
                  Basic Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-right max-w-48 truncate" title={fileDetails.originalName}>
                      {fileDetails.originalName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{fileDetails.type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatFileSize(fileDetails.fileSize)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">MIME Type:</span>
                    <span className="font-medium text-right max-w-32 truncate" title={fileDetails.mimeType}>
                      {fileDetails.mimeType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-right max-w-32 truncate" title={fileDetails.fullPath}>
                      {fileDetails.fullPath}
                    </span>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Storage Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{fileDetails.storageProvider}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Path:</span>
                    <span className="font-medium text-right max-w-32 truncate" title={fileDetails.storagePath}>
                      {fileDetails.storagePath}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Public:</span>
                    <span className="font-medium">{fileDetails.isPublic ? "Yes" : "No"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unique Name:</span>
                    <span className="font-medium text-right max-w-32 truncate" title={fileDetails.uniqueName}>
                      {fileDetails.uniqueName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Owner Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{fileDetails.ownerFullName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-right max-w-48 truncate" title={fileDetails.ownerEmail}>
                      {fileDetails.ownerEmail}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium text-right max-w-32 text-xs">
                      {formatDate(fileDetails.userSince)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timestamps
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium text-right max-w-32 text-xs">
                      {formatDate(fileDetails.uploadedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {fileDetails.downloadUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(fileDetails.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                
                {fileDetails.openUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(fileDetails.openUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}