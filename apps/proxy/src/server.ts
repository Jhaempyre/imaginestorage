import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { pipeline } from "stream";
import { promisify } from "util";
import { FileModel } from "./models/file";
import { UserModel } from "./models/user";
import { UserStorageConfigModel } from "./models/user-storage-config";
import { getFileStream } from "./adapters";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
}
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

app.get("/:userId/:fileId", async (req, res) => {
  console.log(`[${new Date().toISOString()}] GET ${req.originalUrl}`);
  try {
    const { userId, fileId } = req.params;
    const action = req.query.action || "view";

    // 1. Validate user
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Validate file
    const file = await FileModel.findById(fileId);
    if (!file) return res.status(404).json({ error: "File not found" });

    // 3. Verify file belongs to user
    if (!file.ownerId.equals(user._id)) {
      return res.status(403).json({ error: "Forbidden: not your file" });
    }
    console.log(
      `[${new Date().toISOString()}] file.isPublic: ${
        file.isPublic
      }, action: ${action}`
    );

    // 4. Fetch user storage config
    const config = await UserStorageConfigModel.findOne({ userId: user._id });
    if (!config)
      return res.status(400).json({ error: "No storage config found" });
    const creds = config.credentials;
    console.log(
      `[${new Date().toISOString()}] Using provider: ${config.provider}`
    );
    console.debug(
      `[${new Date().toISOString()}] config: ${JSON.stringify(creds)}`
    );

    // 5. Get storage stream
    const rangeHeader = req.headers.range as string | undefined;

    const { stream, meta } = await getFileStream(
      config.provider,
      creds,
      file,
      rangeHeader
    );
    console.log(
      `[${new Date().toISOString()}] originalName: ${
        file.originalName
      }, mime: ${meta.mime}, length: ${meta.length}, range: ${meta.range}`
    );

    // 6. Set headers
    if (meta.mime) res.setHeader("Content-Type", meta.mime);
    if (meta.length) res.setHeader("Content-Length", meta.length);
    if (meta.range) {
      res.status(206);
      res.setHeader("Content-Range", meta.range);
    }

    // 7. Handle actions
    if (action === "download") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );
    }

    // 8. Stream to client
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
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
