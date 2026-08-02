import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadOnCloudinary = async (fileBuffer, mimetype, folder = "shows") => {
  try {
    if (!fileBuffer) {
      throw new Error("No file data provided");
    }

    const options = {
      folder,
      timeout: 120000, // 2 minutes timeout
    };

    if (
      (mimetype && mimetype.startsWith("video/")) ||
      mimetype === "text/plain" ||
      mimetype === "application/octet-stream" ||
      mimetype === "application/x-subrip" ||
      mimetype === "text/vtt"
    ) {
      options.resource_type = "video";
    }

    // Return a Promise for Stream Upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );

      // Buffer ko Readable Stream me convert karke Cloudinary ko bhej rahe hain
      Readable.from(fileBuffer).pipe(uploadStream);
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw error;
  }
};

export default uploadOnCloudinary;