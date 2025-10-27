export type UploadStatusType =
  | "queued"
  | "uploading"
  | "processing"
  | "done"
  | "error"
  | "canceled";

export type UploadItem = {
  id: string;
  file: File;
  status: UploadStatusType;
  progress: number; // 0 - 100
  retries: number;
  maxRetries: number;
  errorMessage?: string;
  xhr?: XMLHttpRequest | null;
  uploadedUrl?: string | null;
};

export type UploadContextValue = {
  addFiles: (files: FileList | File[]) => void;
  items: UploadItem[];
  setMaxParallel: (n: number) => void;
  maxParallel: number;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
};
