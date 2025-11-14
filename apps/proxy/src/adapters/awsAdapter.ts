// src/adapters/awsAdapter.ts
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import stream from "stream";
import { promisify } from "util";
import { IFile } from "../models/file";

const pipeline = promisify(stream.pipeline);
const s3 = new S3Client({ region: process.env.AWS_REGION });

export interface AdapterResult {
  stream: NodeJS.ReadableStream;
  meta: {
    mime?: string | null;
    length?: number | null;
    range?: string | null;
    etag?: string | null;
  };
}

export async function awsGetStream(file: IFile, req: any): Promise<AdapterResult> {
  // providerMetadata should include bucket and key (set at upload time)
  const bucket = file.providerMetadata.bucket ?? process.env.AWS_S3_BUCKET;
  const key = file.providerMetadata.key ?? file.fileName;
  const range = req.headers.range as string | undefined;

  const params: any = { Bucket: bucket, Key: key };
  if (range) params.Range = range;

  const cmd = new GetObjectCommand(params);
  const data = await s3.send(cmd);

  // data.Body is a stream
  return {
    stream: data.Body as unknown as NodeJS.ReadableStream,
    meta: {
      mime: data.ContentType ?? file.mimeType,
      length: data.ContentLength ?? file.fileSize ?? null,
      range: (data as any).ContentRange ?? null,
      etag: data.ETag ?? file.providerMetadata.ETag ?? null
    }
  };
}
