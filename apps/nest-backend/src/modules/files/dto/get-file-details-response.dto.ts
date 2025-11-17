import { FileDocument } from "@/schemas/file.schema";
import { User, UserDocument } from "@/schemas/user.schema";
import { FlattenMaps, Types } from "mongoose";
import { providerKeyOf } from "../utils/key-transfomers";

type ActualPopulatedDocument = Omit<FileDocument, "ownerId"> & {
  ownerId: UserDocument;
};

export class GetFileDetailsResponseDto {
  id: string;
  type: "file" | "folder";
  originalName: string;
  uniqueName: string;
  fullPath: string;
  fileSize: number;

  storageProvider: string;
  storagePath: string;
  providerUrl: string;
  mimeType: string;
  isPublic: boolean;

  ownerId: string;
  ownerFullName: string;
  ownerEmail: string;
  userSince: Date;

  previewUrl: string | null;
  openUrl: string | null;
  downloadUrl?: string | null;

  uploadedAt: Date;

  fromFileDocument(
    fileDoc: ActualPopulatedDocument,
    proxyUrl: string,
  ): GetFileDetailsResponseDto {
    const dto = new GetFileDetailsResponseDto();
    dto.id = fileDoc._id.toString();
    dto.type = fileDoc.type;
    dto.originalName = fileDoc.originalName;
    dto.uniqueName = fileDoc.fileName;
    dto.fullPath = providerKeyOf(fileDoc.fullPath);
    dto.fileSize = fileDoc.fileSize;

    dto.storagePath = fileDoc.storageProvider;
    dto.storagePath = providerKeyOf(fileDoc.fullPath);
    dto.providerUrl = fileDoc.fileUrl;
    dto.mimeType = fileDoc.mimeType;
    dto.isPublic = fileDoc.isPublic;

    const owner = fileDoc.ownerId;
    dto.ownerId = owner._id.toString();
    dto.ownerEmail = owner.email;
    dto.ownerFullName = owner.firstName + " " + owner.lastName;
    dto.userSince = owner.createdAt;

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

  getPreviewUrlForFile(file: ActualPopulatedDocument, proxyUrl): string {
    return (
      proxyUrl +
      file.ownerId._id.toString() +
      "/" +
      file.metadata?.previewImageId
    );
  }

  getOpenUrl(file: ActualPopulatedDocument, proxyUrl): string {
    return proxyUrl + file.ownerId._id.toString() + "/" + file._id;
  }

  getDownloadUrl(file: ActualPopulatedDocument, proxyUrl): string {
    return (
      proxyUrl +
      file.ownerId._id.toString() +
      "/" +
      file._id +
      "?action=download"
    );
  }
}
