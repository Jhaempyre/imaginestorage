// src/adapters/index.ts
import { awsGetStream } from "./awsAdapter";
import { gcpGetStream } from "./gcpAdapter";

export default async function getFileStream(
  provider: string,
  creds: any,
  file: any,
  range?: string
) {
  switch (provider) {
    case "aws":
      return awsGetStream(creds, file, range);

    case "gcp":
      return gcpGetStream(creds, file, range);

    case "local":
      throw new Error("Local provider not implemented");

    case "azure":
      throw new Error("Azure provider not implemented");

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
