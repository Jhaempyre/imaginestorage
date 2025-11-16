import * as sharp from "sharp";
import { FilePreviewHandler } from "../interfaces/handler.interface";

export class ImagePreviewHandler implements FilePreviewHandler {
  canHandle(mime: string) {
    return mime.startsWith("image/");
  }

  async generate(filePath: string) {
    const out = filePath + "_preview.jpg";

    await sharp(filePath)
      .resize(600)
      .jpeg({ quality: 85 })
      .toFile(out);

    return out;
  }
}
