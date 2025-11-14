// src/adapters/index.ts
import { IFile } from "../models/file";
import { awsGetStream } from "./awsAdapter";
import { gcpGetStream } from "./gcpAdapter";

export async function getStreamForFile(file: IFile, req: any) {
  switch (file.storageProvider) {
    case "aws":
      return awsGetStream(file, req);
    case "gcp":
      return gcpGetStream(file, req);
    default:
      throw new Error(`Unsupported provider: ${file.storageProvider}`);
  }
}
