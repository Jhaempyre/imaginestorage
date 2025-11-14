// src/server.ts
import express from "express";
import mongoose from "mongoose";
import { pipeline } from "stream";
import { promisify } from "util";
import { FileModel } from "./models/file";
import { getStreamForFile } from "./adapters";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
console.log(process.env.MONGODB_URI);
console.log(process.env.PORT);

const pipe = promisify(pipeline);

const app = express();
app.use(express.json());

// Simple middleware to populate req.user for demo.
// Replace with your real auth middleware.
app.use((req: any, res, next) => {
  // For demo: if Authorization: Bearer <userId>, set req.user._id = userId
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    req.user = { _id: new mongoose.Types.ObjectId(auth.slice(7)) };
  }
  next();
});

app.get("/file/:fileId", async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    if (!mongoose.Types.ObjectId.isValid(fileId))
      return res.status(400).send("invalid id");

    const file = await FileModel.findById(fileId).exec();
    if (!file || file.deletedAt) return res.status(404).send("Not found");

    // ACL
    // if (!file.isPublic) {
    //   // If no user and no token, block
    //   const token = req.query.token as string | undefined;

    //   if (!req.user && !token) return res.status(403).send("Forbidden");

    //   // If a token is provided, validate it
    //   if (token) {
    //     if (
    //       !file.shareToken ||
    //       file.shareToken !== token ||
    //       !file.isShareTokenValid()
    //     ) {
    //       return res.status(403).send("Token invalid or expired");
    //     }
    //   } else {
    //     // user-based access: must be owner
    //     if (!file.ownerId.equals(req.user._id)) {
    //       return res.status(403).send("Forbidden");
    //     }
    //   }
    // }

    // get adapter stream
    const { stream, meta } = await getStreamForFile(file, req);

    // sanitize + set headers
    if (meta.mime) res.setHeader("Content-Type", meta.mime);
    if (meta.etag) res.setHeader("ETag", meta.etag);
    if (meta.length != null)
      res.setHeader("Content-Length", String(meta.length));
    if (meta.range) {
      res.status(206);
      res.setHeader("Content-Range", meta.range);
      res.setHeader("Accept-Ranges", "bytes");
    } else {
      res.status(200);
      res.setHeader("Accept-Ranges", "bytes");
    }

    // CDN-friendly caching: adjust as your policy requires
    // If file is public, long cache; otherwise short or private
    if (file.isPublic) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "private, max-age=60");
    }

    // Security hygiene: remove any headers we would otherwise forward (we don't forward upstream headers)
    // NOTE: using res.setHeader above ensures only intended headers are present.

    // stream and handle errors
    await pipe(stream as NodeJS.ReadableStream, res as NodeJS.WritableStream);
    // pipeline ends the response
  } catch (err: any) {
    console.error("proxy error:", err);
    if (!res.headersSent) res.status(500).send("Internal server error");
    else res.end();
  }
});

// connect to MongoDB & start
const MONGO = process.env.MONGODB_URI ?? "mongodb://localhost:27017/storage";
const PORT = Number(process.env.PORT ?? 3000);

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("mongodb connected");
    app.listen(PORT, () => console.log("listening on", PORT));
  })
  .catch((err) => {
    console.error("mongo connection failed", err);
    process.exit(1);
  });
