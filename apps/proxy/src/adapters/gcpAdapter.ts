// src/adapters/gcp.ts
import { Storage } from "@google-cloud/storage";

export interface GCPConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  universe_domain: string;
  bucket: string;
}

export async function gcpGetStream(
  creds: GCPConfig,
  file: any,
  range?: string
) {
  const storage = new Storage({
    projectId: creds.project_id,
    credentials: {
      type: creds.type,
      private_key: creds.private_key,
      client_email: creds.client_email,
      client_id: creds.client_id,
      universe_domain: creds.universe_domain,
    },
  });

  console.log("GCP Get Stream - File Path:", file);

  // Parse the Range header ("bytes=start-end")
  let start: number | undefined;
  let end: number | undefined;

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      start = parseInt(match[1], 10);
      end = match[2] ? parseInt(match[2], 10) : undefined;
    }
  }

  const bucket = storage.bucket(creds.bucket);
  const gFile = bucket.file(file.fullPath.slice(4));

  const metadata = (await gFile.getMetadata())[0];

  const stream = gFile.createReadStream(
    start !== undefined ? { start, end } : {}
  );

  return {
    stream: stream,
    meta: {
      mime: metadata.contentType,
      length: Number(metadata.size),
      // range: metadata.contentRange,
      range: `bytes ${start}-${end ?? (metadata.size - 1)}/${metadata.size}`,
    },
  };
}
