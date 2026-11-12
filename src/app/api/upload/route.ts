import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireUserId } from "@/lib/project-auth";
import { isR2Configured, uploadToR2, R2_STORAGE_PATHS } from "@/lib/r2";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

function isImageFile(mimeType: string, filename: string): boolean {
  if (mimeType.startsWith("image/")) {
    return true;
  }
  return /\.(jpe?g|png|webp|gif|svg)$/i.test(filename);
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to upload files.", 401);
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return jsonError("Invalid content type. Expected multipart/form-data.", 400);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return jsonError("Valid file is required.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("File size exceeds 10MB limit.", 413);
    }

    const name = file instanceof File ? file.name : "attachment";
    const type = file.type || "application/octet-stream";
    const isImage = isImageFile(type, name);
    const buffer = await file.arrayBuffer();

    let url: string;
    if (isR2Configured()) {
      const key = R2_STORAGE_PATHS.chatAttachment(userId, name);
      url = await uploadToR2(buffer, key, type);
    } else {
      const publicId = `${userId}_${Date.now()}_${randomUUID().slice(0, 8)}`;
      url = await uploadToCloudinary(buffer, "retzlo/chat-attachments", publicId);
    }

    return NextResponse.json({
      ok: true,
      file: {
        url,
        name,
        size: file.size,
        type,
        isImage
      }
    });
  } catch (error) {
    return parseError(error);
  }
}
