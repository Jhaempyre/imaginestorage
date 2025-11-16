import { Injectable, Logger } from "@nestjs/common";
import { fileTypeFromFile } from "file-type";
import * as path from "path";

import { ImagePreviewHandler } from "./handlers/image.handler";
import { VideoPreviewHandler } from "./handlers/video.handler";
import { PdfPreviewHandler } from "./handlers/pdf.handler";
import { AudioPreviewHandler } from "./handlers/audio.handler";
// import { PdfPreviewHandler } from "./handlers/pdf.handler";
// import { OfficePreviewHandler } from "./handlers/office.handler";
// import { FallbackPreviewHandler } from "./handlers/fallback.handler";

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  private handlers = [
    new ImagePreviewHandler(),
    new VideoPreviewHandler(),
    new PdfPreviewHandler(),
    new AudioPreviewHandler(),
    // new PdfPreviewHandler(),
    // new OfficePreviewHandler(),
    // new FallbackPreviewHandler(),
  ];

  async generatePreview(tempFilePath: string) {
    // detect file type via magic bytes
    const detected = await fileTypeFromFile(tempFilePath);
    const ext = detected?.ext || path.extname(tempFilePath).slice(1);
    const mime = detected?.mime || "application/octet-stream";

    this.logger.debug(`Detected file => ${mime}, ext=${ext}`);

    // find handler
    const handler =
      this.handlers.find((h) => h.canHandle(mime)) ??
      this.handlers[this.handlers.length - 1];

    return handler.generate(tempFilePath);
    // return handler.generate(tempFilePath, { mime, ext });
  }
}
