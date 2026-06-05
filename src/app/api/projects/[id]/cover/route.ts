import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { assertProjectMember, requireUserId } from "@/lib/project-auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Unauthorized.", 401);

    const membership = await assertProjectMember(params.id, userId);
    if (!membership) return jsonError("You do not have access to this project.", 403);

    if (!["OWNER", "ADMIN"].includes(membership.role))
      return jsonError("Only owners and admins can update the cover image.", 403);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return jsonError("No file provided.", 400);
    if (!ALLOWED_TYPES.includes(file.type))
      return jsonError("Invalid file type. Allowed: jpg, png, webp, gif.", 400);
    if (file.size > MAX_SIZE)
      return jsonError("File too large. Max 5 MB.", 400);

    const bytes = await file.arrayBuffer();

    // Upload to Cloudinary — overwrite same publicId per project
    const coverImage = await uploadToCloudinary(
      bytes,
      "retrod/covers",
      `project-${params.id}`
    );

    await prisma.project.update({
      where: { id: params.id },
      data: { coverImage },
    });

    return NextResponse.json({ coverImage });
  } catch (error) {
    console.error("[cover upload]", error);
    return jsonError("Failed to upload cover image.", 500);
  }
}
