import { FileDocument } from "@/schemas/file.schema";
import { FlattenMaps, Types } from "mongoose";

export class GetFilesResponseDto {
  id: string;
  type: "file" | "folder";
  name: string;
  fullPath: string;
  fileSize: number;
  mimeType: string;
  providerMetadata: Record<string, any>;
  previewUrl: string | null;
  openUrl: string | null;
  downloadUrl?: string | null;

  fromFileDocument(
    fileDoc: FlattenMaps<FileDocument> & {
      _id: Types.ObjectId;
    },
    proxyUrl: string,
  ): GetFilesResponseDto {
    const dto = new GetFilesResponseDto();
    dto.id = fileDoc._id.toString();
    dto.type = fileDoc.type;
    dto.name = fileDoc.originalName;
    dto.fullPath = fileDoc.fullPath?.slice?.(4);
    dto.fileSize = fileDoc.fileSize;
    dto.mimeType = fileDoc.mimeType;
    dto.providerMetadata = fileDoc.providerMetadata;
    dto.previewUrl = null;
    dto.openUrl = null;
    dto.downloadUrl = null;

    if (fileDoc.type === "file") {
      if (fileDoc?.metadata?.isPreview) {
        dto.previewUrl = this.getOpenUrl(fileDoc, proxyUrl);
      } else if (fileDoc.metadata?.previewImageId) {
        dto.previewUrl = this.getPreviewUrlForFile(fileDoc, proxyUrl);
      } else if (fileDoc.mimeType?.startsWith("image/")) {
        dto.previewUrl = this.getOpenUrl(fileDoc, proxyUrl);
      }

      dto.openUrl = this.getOpenUrl(fileDoc, proxyUrl);
      dto.downloadUrl = this.getDownloadUrl(fileDoc, proxyUrl);
    }

    return dto;
  }

  getPreviewUrlForFile(file: FileDocument, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file.metadata?.previewImageId;
  }

  getOpenUrl(file: FileDocument, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file._id;
  }

  getDownloadUrl(file: FileDocument, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file._id + "?action=download";
  }
}
