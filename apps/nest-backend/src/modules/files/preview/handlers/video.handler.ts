import { FilePreviewHandler } from "../interfaces/handler.interface";
import * as ffmpeg from "fluent-ffmpeg";
import * as path from "path";

export class VideoPreviewHandler implements FilePreviewHandler {
  canHandle(mime: string) {
    return mime.startsWith("video/");
  }

  generate(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const out = filePath + "_preview.jpg";

      ffmpeg(filePath)
        .screenshots({
          timestamps: ["00:00:01"],
          filename: path.basename(out),
          folder: path.dirname(out),
          size: "640x?"
        })
        .on("end", () => resolve(out))
        .on("error", reject);
    });
  }
}
