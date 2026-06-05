import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

    // Upload to Cloudinary — overwrite same publicId per user
    const avatar = await uploadToCloudinary(
      bytes,
      "retrod/avatars",
      userId // publicId = userId so re-upload replaces the same image
    );

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
