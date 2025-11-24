interface QueryFileObject {
  _id: string;
  ownerId: string;
  originalName: string;
  fullPath: string;
  isPublic: boolean;
  fileSize: string;
  mimeType: string;
  metadata: any;
  createdAt: string;
}

export class ImageFileDto {
  id: string;
  name: string;
  fullPath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;

  isPublic: boolean;
  openUrl: string;
  downloadUrl: string;
  previewUrl: string;

  public fromFileObj(file: QueryFileObject, proxyUrl: string): ImageFileDto {
    const dto = new ImageFileDto();
    dto.id = file._id;
    dto.name = file.originalName;
    dto.fullPath = file.fullPath;
    dto.fileSize = Number(file.fileSize);
    dto.mimeType = file.mimeType;
    dto.createdAt = new Date(file.createdAt);
    dto.isPublic = file.isPublic;

    dto.openUrl = this.getOpenUrl(file, proxyUrl);
    dto.downloadUrl = this.getDownloadUrl(file, proxyUrl);
    dto.previewUrl = this.getPreviewUrlForFile(file, proxyUrl);

    return dto;
  }

  getPreviewUrlForFile(file: QueryFileObject, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file.metadata?.previewImageId;
  }

  getOpenUrl(file: QueryFileObject, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file._id;
  }

  getDownloadUrl(file: QueryFileObject, proxyUrl): string {
    return proxyUrl + file.ownerId + "/" + file._id + "?action=download";
  }
}
