import cloudinary from "../config/cloudinary.js";

const uploadOnCloudinary = async (fileBuffer, mimetype, folder = "shows") => {
  try {
    if (!fileBuffer) {
      throw new Error("No file data provided");
    }

    const base64String = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

    const options = { folder };

    if (mimetype && mimetype.startsWith("video/")) {
      options.resource_type = "video";
      options.chunk_size = 20000000; // 20MB chunks, required for large video uploads via upload_large
      options.timeout = 600000; // 10 minutes, prevents timeout on big files
    } else if (
      mimetype === "text/plain" ||
      mimetype === "application/octet-stream" ||
      mimetype === "application/x-subrip" ||
      mimetype === "text/vtt"
    ) {
      options.resource_type = "video";
    }

    const result = await cloudinary.uploader.upload_large(base64String, options);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw error;
  }
};

export default uploadOnCloudinary;