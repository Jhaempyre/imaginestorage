import { FilePreviewHandler } from "../interfaces/handler.interface";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);

export class PdfPreviewHandler implements FilePreviewHandler {
  canHandle(mime: string): boolean {
    return mime === "application/pdf";
  }

  async generate(filePath: string): Promise<string> {
    const out = filePath + "_preview";
    const outName = path.basename(out);
    const outDir = path.dirname(out);

    await execAsync(
      `pdftoppm -jpeg -f 1 -singlefile "${filePath}" "${path.join(outDir, outName)}"`
    );

    // This produces outName.jpg; ensure naming consistency
    return out + '.jpg';
  }
}
