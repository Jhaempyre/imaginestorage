import mongoose from "mongoose";
import { IFile } from "../models/file";
import { extractToken } from "./extract-token";
import { Request } from "express";
import { decodeJwtOrNull } from "./decord-jwt";
import { UserModel } from "../models/user";
import { appLogger } from "../common/logger";

export async function authenticate(
  req: Request,
  file: IFile & { _id: mongoose.Types.ObjectId }
) {
  if (file.isPublic) return { allowed: true, reason: "public" };

  const tokenData = extractToken(req);
  if (!tokenData) return { allowed: false, reason: "missing_token" };

  const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  const SHARE_SECRET = process.env.SHARING_TOKEN_SECRET!;

  let payload: any = null;

  // Step 1 — Decode with correct secret
  if (tokenData.type === "access") {
    payload = decodeJwtOrNull(tokenData.token, ACCESS_SECRET);
  } else {
    payload = decodeJwtOrNull(tokenData.token, SHARE_SECRET);
  }

  appLogger.log(`Auth payload: ${JSON.stringify(payload)}`);
  if (!payload) return { allowed: false, reason: "invalid_jwt" };

  // Step 2 — Access token logic
  if (payload.sub) {
    if (payload.sub !== file.ownerId.toString()) {
      return { allowed: false, reason: "not_owner" };
    }

    const user = await UserModel.findById(payload.sub).select(
      "-password -refreshToken"
    );

    if (!user || !user.isActive || user.deletedAt) {
      return { allowed: false, reason: "inactive_user" };
    }

    return { allowed: true, reason: "owner" };
  }

  // Step 3 — Sharing token logic
  if (tokenData.type === "sharing") {
    if (
      payload.type === "share" &&
      payload.fileId === file._id.toString() &&
      payload.ownerId === file.ownerId.toString()
    ) {
      return { allowed: true, reason: "share_token" };
    }
    return { allowed: false, reason: "invalid_share_token" };
  }

  return { allowed: false, reason: "unknown_token_shape" };
}
