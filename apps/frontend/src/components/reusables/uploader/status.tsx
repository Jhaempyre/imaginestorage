import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useUpload } from "./provider";
import type { UploadItem } from "./types";
import { getReadableFileSize } from "./utils";

const STATUS_PRIORITY: Record<string, number> = {
  uploading: 1,
  processing: 2,
  queued: 3,
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "error":
    case "canceled":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "uploading":
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case "queued":
      return <Clock className="w-4 h-4 text-gray-400" />;
    case "processing":
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    default:
      return null;
  }
};

interface UploadStatusProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UploadStatus(props: UploadStatusProps) {
  const {
    items,
    retryUpload,
    cancelUpload,
    isUploadStatusTabOpen,
    closeStatusViewerTab,
  } = useUpload();
  const [activeTab, setActiveTab] = useState("queue");

  if (!isUploadStatusTabOpen) {
    return null;
  }

  // Categorize items
  const queuedItems = items
    .filter(
      (it) =>
        it.status === "queued" ||
        it.status === "uploading" ||
        it.status === "processing"
    )
    .sort((a, b) => {
      return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    });
  const doneItems = items.filter((it) => it.status === "done");
  const failedItems = items.filter(
    (it) => it.status === "error" || it.status === "canceled"
  );

  if (items.length === 0) {
    return null;
  }

  const renderUploadItem = (it: UploadItem) => (
    <div
      key={it.id}
      className="group p-3 border border-gray-200 bg-white rounded-lg transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{getStatusIcon(it.status)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {it.file.name}
            </h4>
            <span className="text-xs text-gray-500 shrink-0">
              {getReadableFileSize(it.file.size)}
            </span>
          </div>

          {(it.status === "uploading" || it.status === "queued") && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Progress value={it.progress} className="h-1.5" />
                <span className="text-xs text-gray-600 font-medium min-w-[3ch]">
                  {it.progress}%
                </span>
              </div>
              {it.status === "queued" && (
                <p className="text-xs text-gray-500">Waiting to upload...</p>
              )}
            </div>
          )}

          {it.errorMessage && (
            <div className="flex items-start gap-1.5 mt-1">
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{it.errorMessage}</p>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1">
          {it.status === "uploading" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelUpload(it.id)}
              className="h-8 px-2"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}

          {(it.status === "error" || it.status === "canceled") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => retryUpload(it.id)}
              className="h-8 px-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          )}

          {it.status === "done" && it.uploadedUrl && (
            <Button variant="ghost" size="sm" asChild className="h-8 px-2">
              <a href={it.uploadedUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </a>
            </Button>
          )}

          {it.status === "queued" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelUpload(it.id)}
              className="h-8 px-2"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("w-full", props?.className)}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full gap-2"
      >
        <div className="flex justify-between">
          <TabsList className="grid grid-cols-3 h-auto p-0 bg-transparent shadow-none">
            <TabsTrigger
              value="queue"
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Queue
              {queuedItems.length > 0 && (
                <div className="ml-1 h-5 min-w-5 px-1.5">
                  {queuedItems.length}
                </div>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="done"
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Done
              {doneItems.length > 0 && (
                <div className="ml-1 h-5 min-w-5 px-1.5">
                  {doneItems.length}
                </div>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="failed"
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Failed
              {failedItems.length > 0 && (
                <div className="ml-1 h-5 min-w-5 px-1.5">
                  {failedItems.length}
                </div>
              )}
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeStatusViewerTab}
            className="ml-auto h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <TabsContent
          value="queue"
          className="mt-0 space-y-2 max-h-[400px] overflow-y-auto"
        >
          {queuedItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No files in queue
            </div>
          ) : (
            queuedItems.map(renderUploadItem)
          )}
        </TabsContent>

        <TabsContent
          value="done"
          className="mt-0 space-y-2 max-h-[400px] overflow-y-auto"
        >
          {doneItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No completed uploads
            </div>
          ) : (
            doneItems.map(renderUploadItem)
          )}
        </TabsContent>

        <TabsContent
          value="failed"
          className="mt-0 space-y-2 max-h-[400px] overflow-y-auto"
        >
          {failedItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No failed uploads
            </div>
          ) : (
            failedItems.map(renderUploadItem)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
