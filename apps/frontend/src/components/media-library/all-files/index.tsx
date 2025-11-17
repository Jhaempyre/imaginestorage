import {
  UploadProvider,
  UploadStatus,
} from "@/components/reusables/uploader/index.tsx";
import { CardContent } from "@/components/ui/card";
import { useMediaLibraryStore } from "@/stores/media-library.store";
import { useEffect } from "react";
import { MediaLibraryBreadcrumbs } from "./bread-crumbs/index.tsx";
import { FileGrid } from "./file-grid";
import { PageLayout } from "./page-layout.tsx";
import { MediaLibraryToolbar } from "./toolbar/index.tsx";
import { useGetFilesCommon } from "./utils.ts";
import { API_URL } from "@/config.ts";
import { FolderIcon } from "lucide-react";
import { GlobalUploader } from "@/components/reusables/uploader/global-uploader.tsx";

function AllFilesPageContent() {
  const { currentPath, searchQuery, setUploadStatus } = useMediaLibraryStore();

  const getFilesState = useGetFilesCommon();
  const { data: filesData, isLoading, error, refetch } = getFilesState;

  // Reset upload status when component mounts
  useEffect(() => {
    setUploadStatus(false, 0);
  }, [setUploadStatus]);

  if (error) {
    return (
      <CardContent className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Error loading files
          </h3>
          <p className="text-gray-500 mb-4">
            There was an error loading your files. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </CardContent>
    );
  }

  return (
    <UploadProvider
      uploadUrl={`${API_URL}/files/upload`}
      formFieldName="file"
      currentPath={currentPath}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        <MediaLibraryBreadcrumbs className="p-2 border-b border-gray-200 bg-gray-50" />
        <MediaLibraryToolbar />
        <UploadStatus className="p-2 border-b border-gray-200 bg-gray-50" />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            </div>
          ) : filesData?.data?.items?.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <FolderIcon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No files found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No files match "${searchQuery}"`
                    : currentPath
                    ? "This folder is empty"
                    : "Upload your first file to get started"}
                </p>
                <GlobalUploader />
              </div>
            </div>
          ) : (
            <FileGrid items={filesData?.data?.items || []} />
          )}
        </div>
      </div>{" "}
    </UploadProvider>
  );
}

export function AllFilesPage() {
  return (
    <PageLayout>
      <AllFilesPageContent />
    </PageLayout>
  );
}
