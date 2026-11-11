import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { isR2Configured, uploadToR2, R2_STORAGE_PATHS } from "@/lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Unauthorized.", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return jsonError("No file provided.", 400);
    if (!ALLOWED_TYPES.includes(file.type))
      return jsonError("Invalid file type. Allowed: jpg, png, webp, gif.", 400);
    if (file.size > MAX_SIZE)
      return jsonError("File too large. Max 4 MB.", 400);

    const bytes = await file.arrayBuffer();

    let avatar = "";
    if (isR2Configured()) {
      const ext = file.type.split("/")[1] || "webp";
      const key = R2_STORAGE_PATHS.userAvatar(userId, ext);
      avatar = await uploadToR2(bytes, key, file.type);
    } else {
      // Upload to Cloudinary — overwrite same publicId per user
      avatar = await uploadToCloudinary(
        bytes,
        "retrod/avatars",
        userId // publicId = userId so re-upload replaces the same image
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatar },
    });

    return NextResponse.json({ avatar });
  } catch (error) {
    console.error("[avatar upload]", error);
    return jsonError("Failed to upload avatar.", 500);
  }
}
