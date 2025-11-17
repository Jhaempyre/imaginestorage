import { Upload } from "lucide-react";
import { useUpload } from "./provider";

export function DragoverOverlay() {
  const { isDraggedOver } = useUpload();

  if (!isDraggedOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black opacity-30" />
      <div className="relative p-6 bg-white rounded-lg shadow-lg">
        <Upload className="w-12 h-12 text-gray-600 mb-4" />
        <p className="text-lg font-medium text-gray-800">
          Drop files to upload
        </p>
      </div>
    </div>
  );
}
