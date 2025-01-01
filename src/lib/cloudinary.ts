import { v2 as cloudinary } from "cloudinary";
import env from "./env";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  asset_id?: string;
  version?: number;
  format?: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


interface CloudinaryConfig {
  folder: string;
  resource_type: "auto" | "image" | "video" | "raw";
  quality: "auto" | number;
  fetch_format: "auto" | string;
}

// Cloudinary upload function with improved error handling and type safety
export async function uploadToCloudinary(
  buffer: Buffer,
  config: Partial<CloudinaryConfig> = {}
) {
  try {
    // Default config values
    const defaultConfig: CloudinaryConfig = {
      folder: "next-folder", 
      resource_type: "auto", 
      quality: "auto", 
      fetch_format: "auto", 
    };

    const uploadConfig = { ...defaultConfig, ...config };

    const result = await new Promise<CloudinaryUploadResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadConfig,
          (error, result) => {
            if (error) {
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else if (!result) {
              reject(new Error("Upload succeeded but no result returned"));
            } else {
              resolve(result as CloudinaryUploadResponse);
            }
          }
        );

        // Handle stream errors
        uploadStream.on("error", (error) => {
          reject(new Error(`Stream error: ${error.message}`));
        });

        uploadStream.end(buffer);
      }
    );

    return result.secure_url; // Return the secure URL after uploading
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error during upload"
    );
  }
}

// Enhanced delete function with better error handling
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    // Extract public ID from the URL
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1 || uploadIndex === urlParts.length - 1) {
      throw new Error("Invalid Cloudinary URL format");
    }

    const publicId = urlParts.pop()?.replace(/\.[^/.]+$/, "");

    if (!publicId) {
      throw new Error("Invalid Cloudinary URL format");
    }

    console.log("Deleting image with public ID:", publicId);

    // Attempt to delete the image from Cloudinary
    const response = await cloudinary.uploader.destroy("sliders/" + publicId);

    // Log the full response for debugging purposes
    console.log("Cloudinary delete response:", response);

    if (response.result !== "ok") {
      throw new Error(
        `Failed to delete image: ${response.result || response.error?.message}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Unknown error during deletion");
  }
}

// Helper function to validate image file type and size
export function validateImageFile(file: File | Buffer): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // If the file is a Buffer, assume it's already validated as an image, check the size
  if (Buffer.isBuffer(file)) {
    if (file.length > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }
    return true; // No type check available for a Buffer, but size check is performed
  }

  // If it's a browser File object, check both type and size
  if (file instanceof File) {
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are supported."
      );
    }

    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }
    return true;
  }

  throw new Error("Invalid file. Only File objects or Buffers are supported.");
}
