import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

let r2ClientInstance: S3Client | null = null;

/**
 * Checks whether Cloudflare R2 environment variables are properly configured.
 */
export function isR2Configured(): boolean {
  const hasCredentials = Boolean(
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
  );
  const hasEndpoint = Boolean(
    process.env.R2_ENDPOINT || process.env.R2_ACCOUNT_ID
  );
  const hasBucket = Boolean(process.env.R2_BUCKET_NAME);

  return hasCredentials && hasEndpoint && hasBucket;
}

/**
 * Returns a configured S3Client instance for Cloudflare R2.
 * Throws an Error if required environment variables are missing.
 */
export function getR2Client(): S3Client {
  if (r2ClientInstance) {
    return r2ClientInstance;
  }

  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined);

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "Cloudflare R2 is not properly configured. Missing required credentials or endpoint."
    );
  }

  r2ClientInstance = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  return r2ClientInstance;
}

/**
 * Resets the cached S3Client instance. Primarily used in testing.
 */
export function resetR2Client(): void {
  r2ClientInstance = null;
}

/**
 * Uploads a buffer to Cloudflare R2 and returns its public URL.
 *
 * @param buffer Raw file bytes as ArrayBuffer or Buffer
 * @param key Target object key in R2
 * @param contentType Optional MIME content type
 */
export async function uploadToR2(
  buffer: ArrayBuffer | Buffer,
  key: string,
  contentType?: string
): Promise<string> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "retzlo-storage";
  const cleanKey = key.replace(/^\/+/, "");

  const body = buffer instanceof Buffer ? buffer : Buffer.from(buffer);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
    Body: body,
    ...(contentType ? { ContentType: contentType } : {})
  });

  await client.send(command);

  if (process.env.R2_PUBLIC_URL) {
    const publicBase = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
    return `${publicBase}/${cleanKey}`;
  }

  const endpoint = (
    process.env.R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : "")
  ).replace(/\/+$/, "");

  return `${endpoint}/${bucketName}/${cleanKey}`;
}

/**
 * Deletes an object from Cloudflare R2 bucket by key.
 *
 * @param key Target object key
 * @returns boolean indicating success
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || "retzlo-storage";
    const cleanKey = key.replace(/^\/+/, "");

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cleanKey
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error("Failed to delete object from Cloudflare R2:", error);
    return false;
  }
}

/**
 * Extracts the R2 key from an R2 object URL.
 */
export function extractR2Key(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    const bucketName = process.env.R2_BUCKET_NAME || "retzlo-storage";

    if (pathname.startsWith(`${bucketName}/`)) {
      return pathname.slice(bucketName.length + 1);
    }

    const publicUrl = process.env.R2_PUBLIC_URL;
    if (publicUrl) {
      try {
        const publicParsed = new URL(publicUrl);
        if (parsed.origin === publicParsed.origin) {
          const basePath = publicParsed.pathname.replace(/^\/+|\/+$/g, "");
          if (basePath && pathname.startsWith(`${basePath}/`)) {
            return pathname.slice(basePath.length + 1);
          }
          return pathname;
        }
      } catch {
        // ignore invalid public url env
      }
    }

    const chatsIndex = pathname.indexOf("chats/");
    if (chatsIndex !== -1) {
      return pathname.slice(chatsIndex);
    }

    if (
      pathname.startsWith("projects/") ||
      pathname.startsWith("users/") ||
      pathname.startsWith("exports/")
    ) {
      return pathname;
    }

    return null;
  } catch {
    if (url.includes("chats/")) {
      return url.slice(url.indexOf("chats/"));
    }
    return null;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Standardized folder path generators for Cloudflare R2 object hierarchy.
 */
export const R2_STORAGE_PATHS = {
  userAvatar: (userId: string, ext = "webp") =>
    `users/${userId}/avatar/avatar_${Date.now()}.${ext.replace(/^\./, "")}`,

  projectCover: (projectId: string, ext = "jpg") =>
    `projects/${projectId}/covers/cover_${Date.now()}.${ext.replace(/^\./, "")}`,

  cardAttachment: (projectId: string, cardId: string, filename: string) =>
    `projects/${projectId}/cards/${cardId}/attachments/${Date.now()}_${sanitizeFilename(filename)}`,

  diaryMedia: (projectId: string, diaryId: string, filename: string) =>
    `projects/${projectId}/diary/${diaryId}/media/${Date.now()}_${sanitizeFilename(filename)}`,

  noteAttachment: (projectId: string, noteId: string, filename: string) =>
    `projects/${projectId}/notes/${noteId}/attachments/${Date.now()}_${sanitizeFilename(filename)}`,

  exportReport: (userId: string, filename: string) =>
    `exports/${userId}/${Date.now()}_${sanitizeFilename(filename)}`,

  chatAttachment: (userId: string, filename: string) =>
    `chats/${userId}/${Date.now()}_${sanitizeFilename(filename)}`
} as const;
