import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a Buffer/ArrayBuffer to Cloudinary and return the secure URL.
 * @param buffer  Raw image bytes
 * @param folder  Cloudinary folder, e.g. "retrod/avatars"
 * @param publicId  Deterministic ID so re-uploads overwrite the same asset
 */
export async function uploadToCloudinary(
  buffer: ArrayBuffer,
  folder: string,
  publicId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );

    // Convert ArrayBuffer → Buffer → write to stream
    const buf = Buffer.from(buffer);
    uploadStream.end(buf);
  });
}
