import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSharingUrl } from "@/api/files/mutations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MediaItem } from "@/stores/media-library.store";

interface FileSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaItem | null;
}

export function FileSharingModal({ isOpen, onClose, file }: FileSharingModalProps) {
  const [durationType, setDurationType] = React.useState<"duration" | "timestamp">("duration");
  const [duration, setDuration] = React.useState("1");
  const [durationUnit, setDurationUnit] = React.useState("hours");
  const [timestamp, setTimestamp] = React.useState("");
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const createSharingUrlMutation = useCreateSharingUrl({
    onSuccess: (response) => {
      setShareUrl(response.data.shareUrl);
    },
    onError: (error) => {
      console.error("Failed to create sharing URL:", error);
    },
  });

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setShareUrl(null);
      setCopied(false);
      setDuration("1");
      setDurationUnit("hours");
      setTimestamp("");
      setDurationType("duration");
    }
  }, [isOpen]);

  const handleCreateShareUrl = () => {
    if (!file) return;

    let expiresAt: Date | undefined;
    let durationSeconds: number | undefined;

    if (durationType === "duration") {
      const durationValue = parseInt(duration);
      if (isNaN(durationValue) || durationValue <= 0) return;

      // Convert to seconds
      const multiplier = {
        minutes: 60,
        hours: 60 * 60,
        days: 60 * 60 * 24,
        weeks: 60 * 60 * 24 * 7,
      }[durationUnit] || 60 * 60;

      durationSeconds = durationValue * multiplier;
    } else {
      if (!timestamp) return;
      expiresAt = new Date(timestamp);
      if (isNaN(expiresAt.getTime()) || expiresAt <= new Date()) return;
    }

    createSharingUrlMutation.mutate({
      fileId: file.id,
      expiresAt,
      durationSeconds,
    });
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // At least 1 minute in the future
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  if (!isOpen || !file) return null;

  // Show direct link for public files
  if (file.isPublic) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
          <h2 className="text-lg font-semibold mb-4">Share Public File</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              This file is public. Anyone with this link can access it:
            </p>
            <div className="flex gap-2">
              <Input
                value={file.openUrl || ''}
                readOnly
                className="flex-1 text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (file.openUrl) {
                    navigator.clipboard.writeText(file.openUrl);
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show time-limited sharing for private files
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">Share Private File</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">File: <span className="font-medium">{file.name}</span></p>
        </div>

        {!shareUrl ? (
          <>
            {/* Duration Type Selection */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Expiration Method</Label>
              <Select value={durationType} onValueChange={(value: "duration" | "timestamp") => setDurationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Duration from now</SelectItem>
                  <SelectItem value="timestamp">Specific date & time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {durationType === "duration" ? (
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Duration</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration"
                    className="flex-1"
                  />
                  <Select value={durationUnit} onValueChange={setDurationUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Min</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <Label htmlFor="timestamp" className="text-sm font-medium mb-2 block">
                  Expiration Date & Time
                </Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={timestamp}
                  min={getMinDateTime()}
                  onChange={(e) => setTimestamp(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateShareUrl}
                disabled={
                  createSharingUrlMutation.isPending ||
                  (durationType === "duration" && (!duration || parseInt(duration) <= 0)) ||
                  (durationType === "timestamp" && !timestamp)
                }
              >
                {createSharingUrlMutation.isPending ? "Creating..." : "Create Share URL"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert className="mb-4">
              <AlertDescription>
                Share URL created successfully! This link will expire based on your settings.
              </AlertDescription>
            </Alert>

            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Shareable URL</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  variant={copied ? "default" : "outline"}
                  onClick={handleCopyUrl}
                  className="whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShareUrl(null);
                  setCopied(false);
                }}
              >
                Create Another
              </Button>
            </div>
          </>
        )}

        {createSharingUrlMutation.error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              Failed to create share URL. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}