// src/adapters/gcpAdapter.ts
import { Storage } from "@google-cloud/storage";
import { IFile } from "../models/file";

const storage = new Storage();

export async function gcpGetStream(file: IFile, req: any) {
  const bucketName = file.providerMetadata.bucket ?? process.env.GCP_BUCKET;
  const filePath = file.providerMetadata.path ?? file.fileName;
  const bucket = storage.bucket(bucketName);
  const gcsFile = bucket.file(filePath);

  // Range handling (GCS supports start/end options)
  const range = req.headers.range as string | undefined;
  const options: any = {};
  if (range) {
    // parse "bytes=start-end"
    const m = /bytes=(\d+)-(\d+)?/.exec(range);
    if (m) {
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : undefined;
      options.start = start;
      if (end !== undefined) options.end = end;
    }
  }

  const meta = (await gcsFile.getMetadata())[0];

  return {
    stream: gcsFile.createReadStream(options),
    meta: {
      mime: meta.contentType ?? file.mimeType,
      length: meta.size ? Number(meta.size) : file.fileSize ?? null,
      range: null,
      etag: meta.etag ?? file.providerMetadata.etag ?? null
    }
  };
}
