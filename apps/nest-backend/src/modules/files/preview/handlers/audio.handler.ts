import { FilePreviewHandler } from "../interfaces/handler.interface";
import * as ffmpeg from "fluent-ffmpeg";

export class AudioPreviewHandler implements FilePreviewHandler {
  canHandle(mime: string): boolean {
    return mime.startsWith("audio/");
  }

  async generate(filePath: string): Promise<string> {
    const out = filePath + "_preview.png";

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .inputOptions(["-vn"]) // ensure audio only
        .outputOptions([
          "-filter_complex",
          "[0:a]aformat=channel_layouts=mono,showwavespic=s=600x120:colors=#00FF00|#88FF00|#AAFF66[wave]",
          "-map",
          "[wave]",             // map generated waveform image
          "-frames:v",
          "1"
        ])
        .save(out)
        .on("end", () => resolve(out))
        .on("error", (err) => reject(new Error("FFmpeg audio preview error: " + err)));
    });
  }
}
