import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import React, { useRef } from "react";
import { useUpload } from "./provider";

export function GlobalUploader() {
  const { addFiles } = useUpload();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPick = () => {
    inputRef.current?.click();
  };

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files) addFiles(ev.target.files);
    ev.currentTarget.value = "";
  };

  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={onChange}
      />

      <Button onClick={onPick} className="flex items-center space-x-2">
        <UploadIcon className="w-4 h-4" />
        <span>Upload</span>
      </Button>
    </div>
  );
}
