// src/adapters/gcp.ts
import { Storage } from "@google-cloud/storage";

export async function gcpGetStream(creds: any, file: any, range?: string) {
  const storage = new Storage({
    projectId: creds.projectId,
    credentials: JSON.parse(creds.keyFile),
  });

  const bucket = storage.bucket(creds.bucketName);
  const gFile = bucket.file(file.providerMetadata.path);

  const metadata = (await gFile.getMetadata())[0];

  return {
    stream: gFile.createReadStream(),
    meta: {
      mime: metadata.contentType,
      length: Number(metadata.size),
      range: null,
    },
  };
}
