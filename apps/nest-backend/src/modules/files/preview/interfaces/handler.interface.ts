export interface FilePreviewHandler {
  canHandle(mime: string): boolean;
  generate(filePath: string, meta: { mime: string; ext: string }): Promise<string>;
}
