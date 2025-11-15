// src/adapters/aws.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export async function awsGetStream(
  creds: any,
  file: any,
  rangeHeader?: string
) {
  const s3 = new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
    },
  });

  const params: any = {
    Bucket: creds.bucketName,
    Key: file.fileName,
  };

  if (rangeHeader) params.Range = rangeHeader;

  const result = await s3.send(new GetObjectCommand(params));

  return {
    stream: result.Body as Readable,
    meta: {
      mime: result.ContentType || file.mimeType,
      length: result.ContentLength,
      range: (result as any).ContentRange,
    },
  };
}
