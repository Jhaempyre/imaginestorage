import { FILES_QUERY_KEYS } from "@/api/files";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { UploadContextValue, UploadItem } from "./types";
import { DragoverOverlay } from "./dragover-overlay";

const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}

type ProviderProps = {
  children: React.ReactNode;
  uploadUrl?: string; // endpoint
  currentPath: string;
  headers?: Record<string, string>;
  formFieldName?: string;
  defaultMaxParallel?: number;
  defaultMaxRetries?: number;
  sendCookies?: boolean; // allow toggling whether to send cookies with XHR
};

const DEBUG = true;

/*
  High level:
  - Keep an items array in state
  - spawn uploads up to maxParallel
  - each upload uses XHR and reports progress
  - support cancel and retry
*/
export function UploadProvider({
  children,
  uploadUrl = "/upload",
  headers = {},
  formFieldName = "file",
  defaultMaxParallel = 3,
  defaultMaxRetries = 2,
  currentPath = "/",
  sendCookies = true, // send cookies by default
}: ProviderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const pendingRef = useRef<Record<string, UploadItem>>({});
  const completedRef = useRef<Record<string, UploadItem>>({});
  const activeCountRef = useRef(0);
  const maxParallelRef = useRef(defaultMaxParallel);
  const maxRetriesRef = useRef(defaultMaxRetries);
  const [isUploadStatusTabOpen, setIsUploadStatusTabOpen] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  // const queueOpenRef = useRef(false);
  const [, forceRerender] = useState(0);
  const queryClient = useQueryClient();

  // helper to create unique id
  const makeId = (f: File) =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${f.name}`;

  const closeStatusViewerTab = () => {
    setIsUploadStatusTabOpen(false);
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    if (!arr.length) return;
    setIsUploadStatusTabOpen(true);
    const newItems: UploadItem[] = arr.map((f) => {
      const it: UploadItem = {
        id: makeId(f),
        file: f,
        status: "queued",
        progress: 0,
        retries: 0,
        maxRetries: maxRetriesRef.current,
        xhr: null,
        uploadedUrl: null,
      };
      pendingRef.current[it.id] = it;
      return it;
    });
    setItems((prev) => [...prev, ...newItems]);
    // kick queue runner
    setTimeout(() => runQueue(), 0);
  }, []);

  const setMaxParallel = useCallback((n: number) => {
    maxParallelRef.current = Math.max(1, Math.floor(n));
    forceRerender((s) => s + 1);
    setTimeout(() => runQueue(), 0);
  }, []);

  const runQueue = useCallback(() => {
    // spawn as many as allowed
    const maxParallel = maxParallelRef.current;
    const itemsSnapshot = items; // use closure snapshot
    // count active
    activeCountRef.current = itemsSnapshot.filter(
      (i) => i.status === "uploading"
    ).length;
    if (activeCountRef.current >= maxParallel) return;
    const slots = maxParallel - activeCountRef.current;
    const queued = itemsSnapshot
      // .filter((i) => i.status === "queued")
      .filter(function (i) {
        const isPending = i.id in pendingRef.current;
        const isDone = i.id in completedRef.current;
        return !isPending && !isDone;
      })
      .slice(0, slots);
    if (!queued.length) return;
    for (const it of queued) {
      startUpload(it);
    }
  }, [items]);

  // low-level upload fn using XHR with progress, retry, cancel
  const startUpload = useCallback(
    (item: UploadItem) => {
      // DEBUG && alert(`Starting upload for item ${item.id} (${item.file.name})`);
      // re-get item from state to ensure we have latest
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);
        if (!found || found.status === "uploading") return prev;
        const updated = prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                status: "uploading",
                progress: 0,
                errorMessage: undefined,
              }
            : p
        );
        return updated as any;
      });

      activeCountRef.current += 1;

      const xhr = new XMLHttpRequest();
      const id = item.id;

      // ensure cookies/credentials are included when requested
      try {
        xhr.withCredentials = !!sendCookies;
      } catch {
        // ignore if not supported
      }

      // Attach to pendingRef so we can cancel
      pendingRef.current[id] = { ...item, xhr };

      xhr.upload.onprogress = (ev) => {
        const progress = ev.lengthComputable
          ? Math.round((ev.loaded / ev.total) * 100)
          : 0;
        setItems((prev) => {
          if (progress < 100) {
            return prev.map((p) => (p.id === id ? { ...p, progress } : p));
          } else {
            return prev.map((p) =>
              p.id === id ? { ...p, progress: 100, status: "processing" } : p
            );
          }
        });
      };

      xhr.onload = () => {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        // success if 2xx
        if (xhr.status >= 200 && xhr.status < 300) {
          // attempt to parse response for uploaded URL, fallback to null
          let uploadedUrl = null;
          try {
            const resp = JSON.parse(xhr.responseText || "{}").data || {};
            uploadedUrl = resp.file.url || resp.file.fileUrl || null;
          } catch {
            uploadedUrl = null;
          }
          setItems((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: "done",
                    progress: 100,
                    xhr: null,
                    uploadedUrl,
                  }
                : p
            )
          );
          delete pendingRef.current[id];
          completedRef.current[id] = item;
          queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.lists() });
          // spawn next
          setTimeout(() => runQueue(), 0);
          return;
        }
        // treat as error
        const errMsg = `Upload failed: ${xhr.status} ${xhr.statusText}`;
        handleUploadError(id, errMsg);
      };

      xhr.onerror = () => {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        DEBUG && alert("Network error occurred during file upload.");
        handleUploadError(id, "Network error");
      };

      xhr.onabort = () => {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        setItems((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: "canceled", xhr: null } : p
          )
        );
        delete pendingRef.current[id];
        setTimeout(() => runQueue(), 0);
      };

      xhr.open("POST", uploadUrl, true);

      // set headers
      for (const k of Object.keys(headers)) {
        try {
          xhr.setRequestHeader(k, headers[k]);
        } catch {
          // ignore
        }
      }

      const form = new FormData();
      form.append(formFieldName, item.file, item.file.name);
      form.append("folderPath", currentPath);

      try {
        xhr.send(form);
      } catch (err: any) {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        handleUploadError(id, err?.message || "Send error");
      }
    },
    [uploadUrl, headers, formFieldName, sendCookies, currentPath] // include sendCookies (and currentPath) in deps
  );

  const handleUploadError = useCallback((id: string, message?: string) => {
    DEBUG && alert(`Handling upload error for item ${id}: ${message}`);
    setItems((prev) => {
      return prev.map((p) => {
        if (p.id !== id) return p;
        const nextRetries = (p.retries || 0) + 1;
        if (nextRetries <= (p.maxRetries ?? maxRetriesRef.current)) {
          // schedule retry with exponential backoff
          const backoff = 500 * Math.pow(2, nextRetries - 1);
          setTimeout(() => {
            setItems((prev2) =>
              prev2.map((q) =>
                q.id === id
                  ? {
                      ...q,
                      status: "queued",
                      retries: nextRetries,
                      progress: 0,
                      errorMessage: undefined,
                    }
                  : q
              )
            );
            setTimeout(() => runQueue(), 0);
          }, backoff);
          return {
            ...p,
            status: "error",
            errorMessage: message || "Upload error",
            retries: nextRetries,
            xhr: null,
          };
        } else {
          // mark as error permanently
          delete pendingRef.current[id];
          return {
            ...p,
            status: "error",
            errorMessage: message || "Upload error",
            xhr: null,
            retries: nextRetries,
          };
        }
      });
    });
  }, []);

  useEffect(() => {
    // whenever items change, try to run queue
    // small debounce to avoid tight loops
    const t = setTimeout(() => {
      const maxParallel = maxParallelRef.current;
      const active = items.filter((i) => i.status === "uploading").length;
      if (active < maxParallel) {
        const slots = maxParallel - active;
        const queued = items
          .filter((i) => i.status === "queued")
          .slice(0, slots);
        queued.forEach((it) => startUpload(it));
      }
    }, 50);
    return () => clearTimeout(t);
  }, [items, startUpload]);

  const cancelUpload = useCallback((id: string) => {
    DEBUG && alert(`Canceling upload for item ${id}`);
    const p = pendingRef.current[id];
    if (p && p.xhr) {
      try {
        p.xhr.abort();
      } catch {}
    } else {
      // if not uploading, mark canceled
      setItems((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "canceled" } : q))
      );
      delete pendingRef.current[id];
    }
  }, []);

  const retryUpload = useCallback((id: string) => {
    DEBUG && alert(`Retrying upload for item ${id}`);
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "queued", progress: 0, errorMessage: undefined }
          : p
      )
    );
    setTimeout(() => runQueue(), 0);
  }, []);

  const clearCompleted = useCallback(() => {
    DEBUG && alert("Clearing completed and canceled uploads from the list");
    setItems((prev) =>
      prev.filter((p) => p.status !== "done" && p.status !== "canceled")
    );
  }, []);

  // drag/drop handlers on provider wrapper
  const onDrop = useCallback(
    (ev: React.DragEvent) => {
      ev.preventDefault();

      const dt = ev.dataTransfer;
      if (!dt) return;

      // Only handle external file drops
      const isFileDrag = dt.types.includes("Files");
      if (!isFileDrag) return;

      if (dt.files?.length) addFiles(dt.files);
      setIsDraggedOver(false);
    },
    [addFiles]
  );

  const onDragOver = useCallback(
    (ev: React.DragEvent) => {
      const isFileDrag = ev.dataTransfer.types.includes("Files");
      if (!isFileDrag) return;

      ev.preventDefault();
      ev.dataTransfer.dropEffect = "copy";

      if (!isDraggedOver) setIsDraggedOver(true);
    },
    [isDraggedOver]
  );

  const onDragLeave = useCallback((ev: React.DragEvent) => {
    const isFileDrag = ev.dataTransfer.types.includes("Files");
    if (!isFileDrag) return;

    ev.preventDefault();
    setIsDraggedOver(false);
  }, []);

  // expose context value
  const value = useMemo(
    () => ({
      addFiles,
      items,
      setMaxParallel,
      maxParallel: maxParallelRef.current,
      cancelUpload,
      retryUpload,
      clearCompleted,
      isUploadStatusTabOpen,
      closeStatusViewerTab,
      isDraggedOver,
      setIsDraggedOver,
    }),
    [
      addFiles,
      items,
      cancelUpload,
      retryUpload,
      clearCompleted,
      setMaxParallel,
      isUploadStatusTabOpen,
      closeStatusViewerTab,
      isDraggedOver,
      setIsDraggedOver,
    ]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      // abort all active XHRs
      Object.values(pendingRef.current).forEach((p) => {
        if (p && p.xhr) {
          try {
            p.xhr.abort();
          } catch {}
        }
      });
      pendingRef.current = {};
    };
  }, []);

  return (
    <UploadContext.Provider value={value}>
      <DragoverOverlay />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{ height: "100%" }}
      >
        {children}
      </div>
    </UploadContext.Provider>
  );
}
